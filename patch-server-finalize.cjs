const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const finalizeEndpoint = `
  app.post("/api/tg-finalize", async (req, res) => {
    try {
      const { examId } = req.body;
      if (!examId) return res.status(400).json({ error: "Missing examId" });
      
      const examDoc = await adminDb.collection('exams').doc(examId).get();
      if (!examDoc.exists) return res.status(404).json({ error: "Exam not found" });
      
      const examData = examDoc.data();
      const examTitle = examData.title || "Imtihon";
      const raschReport = examData.raschReport;
      
      if (!raschReport || !raschReport.results) {
        return res.status(400).json({ error: "No Rasch report available" });
      }
      
      const results = raschReport.results.filter(r => !r.synthetic); // Only real users
      
      const { bot } = require('./src/server/bot');
      if (bot) {
        for (const r of results) {
          const userDoc = await adminDb.collection('users').doc(r.studentId).get();
          if (userDoc.exists) {
            const tgChatId = userDoc.data().telegramChatId;
            if (tgChatId) {
              const msg = \`Natijalar e'lon qilindi! 📊\\n\\n"\${examTitle}" imtihoni yakunlandi.\\n\\nSizning natijangiz:\\nTo'g'ri javoblar: \${r.correct} ta\\nTo'plagan balingiz: \${r.ball} ball\\nDaraja: \${r.grade}\\nO'rningiz: \${r.rank}-o'rin (Top \${100 - (r.percentile || 0)}%)\\n\\nTabriklaymiz!\`;
              bot.telegram.sendMessage(tgChatId, msg).catch((e) => console.error("TG Finalize send error:", e));
            }
          }
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("TG Finalize Error:", error);
      res.status(500).json({ error: "Internal error" });
    }
  });

`;

code = code.replace('app.get("/api/notification-debug"', finalizeEndpoint + 'app.get("/api/notification-debug"');
fs.writeFileSync('server.ts', code);
