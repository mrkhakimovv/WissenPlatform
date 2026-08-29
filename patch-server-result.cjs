const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const resultEndpoint = `
  app.post("/api/tg-result", async (req, res) => {
    try {
      const { studentId, examId, score, total } = req.body;
      if (!studentId || !examId) return res.status(400).json({ error: "Missing data" });
      
      const userDoc = await adminDb.collection('users').doc(studentId).get();
      if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
      
      const examDoc = await adminDb.collection('exams').doc(examId).get();
      const examTitle = examDoc.exists ? examDoc.data().title : "Imtihon";
      
      const tgChatId = userDoc.data().telegramChatId;
      if (tgChatId) {
        // Send telegram message
        const { bot } = require('./src/server/bot');
        if (bot) {
          bot.telegram.sendMessage(
            tgChatId,
            \`Tugallandi! ✅\\n\\nSiz "\${examTitle}" imtihonini muvaffaqiyatli topshirdingiz.\\nNatija: \${score} / \${total} ta to'g'ri.\\n\\nImtihon to'liq yakunlangach (barcha topshirib bo'lgach), Rasch modeli asosida hisoblangan yakuniy balingiz e'lon qilinadi.\`
          ).catch((e) => console.error("TG send error:", e));
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("TG Result Error:", error);
      res.status(500).json({ error: "Internal error" });
    }
  });

`;

code = code.replace('app.get("/api/notification-debug"', resultEndpoint + 'app.get("/api/notification-debug"');
fs.writeFileSync('server.ts', code);
