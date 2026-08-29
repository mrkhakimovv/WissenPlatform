const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMilliySertifikat.tsx', 'utf-8');

const fetchCall = `
      await updateDoc(doc(db, 'exams', exam.id), {
        status: 'ended',
        finalizedAt: exam.finalizedAt || new Date().toISOString(), // keep original finalizedAt if it exists
        raschReport: report,
      });
      
      try {
        await fetch('/api/tg-finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examId: exam.id })
        });
      } catch (e) {
        console.error("TG finalize trigger failed:", e);
      }
`;

code = code.replace(`      await updateDoc(doc(db, 'exams', exam.id), {
        status: 'ended',
        finalizedAt: exam.finalizedAt || new Date().toISOString(), // keep original finalizedAt if it exists
        raschReport: report,
      });`, fetchCall);
fs.writeFileSync('src/pages/admin/AdminMilliySertifikat.tsx', code);
