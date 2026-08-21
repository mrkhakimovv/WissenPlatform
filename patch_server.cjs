const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const importTarget = `import { analyzeTeacherExamples, evaluateHomework } from "./src/server/evaluator";`;
const newImport = `import { analyzeTeacherExamples, evaluateHomework } from "./src/server/evaluator";
import { adminAuth, adminDb, adminMessaging } from "./src/server/notifications";`;
code = code.replace(importTarget, newImport);

const routeTarget = `  // Vite middleware for development`;
const newRoute = `
  app.post("/api/send-notification", apiLimiter, async (req, res) => {
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

      // Collect tokens
      let tokens: string[] = [];
      let query = adminDb.collection('users').where('role', '==', 'student');
      
      if (target === 'group' && targetId) {
        query = query.where('groups', 'array-contains', targetId);
      }
      
      const usersSnap = await query.get();
      
      const userRefsToUpdate: any[] = [];
      
      usersSnap.forEach(doc => {
        if (target === 'user' && doc.id !== targetId) return;
        
        const data = doc.data();
        if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
          data.fcmTokens.forEach((t: string) => tokens.push(t));
        }
      });

      if (tokens.length === 0) {
        return res.json({ success: true, message: "Tokenlar topilmadi, faqat bazaga saqlandi", id: notifRef.id });
      }

      // Send via FCM
      const response = await adminMessaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: { link: link || '/' },
        webpush: {
          fcmOptions: {
            link: link || '/'
          }
        }
      });

      // Cleanup invalid tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        // Quick cleanup (could be optimized)
        for (const fToken of failedTokens) {
          const snapshot = await adminDb.collection('users').where('fcmTokens', 'array-contains', fToken).get();
          snapshot.forEach(doc => {
            doc.ref.update({
              fcmTokens: admin.firestore.FieldValue.arrayRemove(fToken)
            });
          });
        }
      }

      res.json({ success: true, sent: response.successCount, failed: response.failureCount, id: notifRef.id });
    } catch (error: any) {
      console.error("Xabarnoma xatosi:", error);
      res.status(500).json({ error: error.message || "Xabarnoma yuborishda xatolik yuz berdi" });
    }
  });

  // Vite middleware for development`;

code = code.replace(routeTarget, newRoute);

fs.writeFileSync('server.ts', code);
