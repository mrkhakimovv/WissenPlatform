import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";
import { analyzeTeacherExamples, evaluateHomework } from "./src/server/evaluator";
import { adminAuth, adminDb, adminMessaging, FieldValue } from "./src/server/notifications";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window`
    message: { error: "Juda ko'p so'rov yuborildi. Iltimos 15 daqiqadan keyin qayta urinib ko'ring." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Xabarnoma yuborish uchun alohida (kengroq) limit.
  // AI endpointlari qimmat, shuning uchun ular 10 ta bilan cheklangan.
  // Ammo admin yangilik/test qo'shganda har safar avtomatik xabarnoma yuboriladi —
  // 10 ta limit tez tugab, xabarnomalar jimgina yuborilmay qolardi.
  const notifLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 100, // har IP uchun 15 daqiqada 100 ta xabarnoma so'rovi
    message: { error: "Juda ko'p xabarnoma so'rovi. Iltimos birozdan keyin qayta urinib ko'ring." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // API Routes
  app.post("/api/analyze-teacher-examples", apiLimiter, async (req, res) => {
    try {
      const { images } = req.body;
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Rasmlar taqdim etilmadi." });
      }

      const result = await analyzeTeacherExamples(images);
      res.json(result);
    } catch (error: any) {
      console.error("Tahlil xatosi:", error);
      const status = error.message.includes('API kalit') ? 401 : 500;
      res.status(status).json({ error: error.message || "Tahlil jarayonida xatolik yuz berdi" });
    }
  });

  app.post("/api/vazifa-baholash", apiLimiter, async (req, res) => {
    try {
      const { images, taskReference } = req.body;
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Rasmlar taqdim etilmadi." });
      }

      const result = await evaluateHomework(images, taskReference);
      res.json(result);
    } catch (error: any) {
      console.error("Baholash xatosi:", error);
      const status = error.message.includes('API kalit') ? 401 : 500;
      res.status(status).json({ error: error.message || "Baholash jarayonida xatolik yuz berdi" });
    }
  });


  app.post("/api/send-notification", notifLimiter, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Auth required" });
      }
      
      const token = authHeader.split('Bearer ')[1];
      if (!adminAuth || !adminDb || !adminMessaging) {
        return res.status(500).json({ error: "Firebase admin not initialized" });
      }

      const decoded = await adminAuth.verifyIdToken(token);
      const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
      
      if (!userDoc.exists || (userDoc.data()?.role !== 'admin' && userDoc.data()?.role !== 'teacher')) {
        return res.status(403).json({ error: "Faqat admin yoki o'qituvchi yubora oladi" });
      }

      const { title, body, link, target, targetId } = req.body;
      
      // Save to Firestore notifications collection
      const newNotif = {
        title,
        body,
        link: link || null,
        target,
        targetId: targetId || null,
        createdBy: decoded.uid,
        createdAt: new Date().toISOString(),
        readBy: []
      };
      
      const notifRef = await adminDb.collection('notifications').add(newNotif);

      // Qabul qiluvchilarni yig'amiz (target bo'yicha), takrorlanmasligi uchun Map ishlatamiz
      const userDocsMap = new Map<string, any>();

      if (target === 'user' && targetId) {
        // Bitta foydalanuvchi — to'g'ridan-to'g'ri hujjatni olamiz
        const singleDoc = await adminDb.collection('users').doc(targetId).get();
        if (singleDoc.exists) userDocsMap.set(singleDoc.id, singleDoc.data());
      } else if (target === 'group' && targetId) {
        // MUHIM: talaba guruhi 'groups' (massiv) YOKI 'groupId' (bitta qiymat) da
        // saqlanishi mumkin (oddiy qo'shish formasi faqat 'groupId' ni yozadi).
        // Faqat 'groups array-contains' bilan qidirsak — 'groupId' li talabalar
        // xabarnomani umuman olmaydi. Shuning uchun ikkala maydonni ham tekshiramiz.
        const [byArray, bySingle] = await Promise.all([
          adminDb.collection('users').where('groups', 'array-contains', targetId).get(),
          adminDb.collection('users').where('groupId', '==', targetId).get(),
        ]);
        byArray.forEach(d => userDocsMap.set(d.id, d.data()));
        bySingle.forEach(d => userDocsMap.set(d.id, d.data()));
      } else {
        // 'all' — barcha talabalar
        const usersSnap = await adminDb.collection('users').where('role', '==', 'student').get();
        usersSnap.forEach(d => userDocsMap.set(d.id, d.data()));
      }

      // Tokenlarni yig'amiz (takrorlanmas)
      const tokenSet = new Set<string>();
      userDocsMap.forEach(data => {
        if (data?.fcmTokens && Array.isArray(data.fcmTokens)) {
          data.fcmTokens.forEach((t: string) => { if (t) tokenSet.add(t); });
        }
      });
      const tokens: string[] = Array.from(tokenSet);

      if (tokens.length === 0) {
        return res.json({ success: true, message: "Tokenlar topilmadi, faqat bazaga saqlandi", id: notifRef.id, sent: 0, failed: 0 });
      }

      // Data-only xabar: 'notification' kaliti bo'lsa, orqa fonda brauzer uni
      // avtomatik ko'rsatadi VA service worker ham ko'rsatadi = 2 ta dublikat.
      // Buni oldini olish uchun faqat 'data' yuboramiz; ko'rsatishni SW bajaradi.
      // (FCM 'data' qiymatlari faqat string bo'lishi kerak.)
      const dataPayload = {
        title: String(title || ''),
        body: String(body || ''),
        link: String(link || '/'),
        notifId: notifRef.id,
      };

      // sendEachForMulticast bir chaqiruvda maksimal 500 ta token qabul qiladi.
      // Talabalar ko'p bo'lsa 500 dan oshib xatolik bermasligi uchun bo'laklaymiz.
      let successCount = 0;
      let failureCount = 0;
      const failedTokens: string[] = [];

      for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);
        const response = await adminMessaging.sendEachForMulticast({
          tokens: batch,
          data: dataPayload,
          webpush: {
            fcmOptions: { link: link || '/' }
          }
        });
        successCount += response.successCount;
        failureCount += response.failureCount;
        response.responses.forEach((resp, idx) => {
          if (!resp.success) failedTokens.push(batch[idx]);
        });
      }

      // Yaroqsiz (eskirgan) tokenlarni bazadan tozalaymiz
      for (const fToken of failedTokens) {
        const snapshot = await adminDb.collection('users').where('fcmTokens', 'array-contains', fToken).get();
        snapshot.forEach(doc => {
          doc.ref.update({ fcmTokens: FieldValue.arrayRemove(fToken) });
        });
      }

      res.json({ success: true, sent: successCount, failed: failureCount, id: notifRef.id });
    } catch (error: any) {
      console.error("Xabarnoma xatosi:", error);
      res.status(500).json({ error: error.message || "Xabarnoma yuborishda xatolik yuz berdi" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 5 (path-to-regexp v8) yalang'och '*' ni qabul qilmaydi.
    // SPA fallback uchun RegExp ishlatamiz (barcha GET yo'llar → index.html).
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();