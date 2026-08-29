const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const tgEndpoint = `
  app.post("/api/tg-auth", async (req, res) => {
    try {
      const { tgUserId } = req.body;
      if (!tgUserId) return res.status(400).json({ error: "Missing tgUserId" });
      
      if (!adminDb || !adminAuth) {
        return res.status(500).json({ error: "Firebase admin not initialized" });
      }

      const usersSnap = await adminDb.collection('users').where('telegramChatId', '==', Number(tgUserId)).get();
      if (usersSnap.empty) {
        return res.status(404).json({ error: "User not found for this Telegram ID" });
      }

      const uid = usersSnap.docs[0].id;
      const customToken = await adminAuth.createCustomToken(uid);
      res.json({ token: customToken });
    } catch (error) {
      console.error("TG Auth Error:", error);
      res.status(500).json({ error: "Internal error" });
    }
  });

`;

code = code.replace('app.get("/api/notification-debug"', tgEndpoint + 'app.get("/api/notification-debug"');
fs.writeFileSync('server.ts', code);
