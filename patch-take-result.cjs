const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

const fetchCall = `
      // Notify via TG
      try {
        await fetch('/api/tg-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: user.id,
            examId: exam.id,
            score: totalCorrect,
            total: totalQuestionsComputed
          })
        });
      } catch (err) {
        console.error("TG notify error:", err);
      }
      
      toast.success("Imtihon topshirildi!");
`;

code = code.replace('toast.success("Imtihon topshirildi!");', fetchCall);
fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
