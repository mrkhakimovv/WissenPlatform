const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

// Replace checkOpen entirely
code = code.replace(
  /console\.log\("checkOpen defined"\); const checkOpen = async \(studentVal: string, correctVal: string\): Promise<number> => \{[\s\S]*?catch \(err\) \{[\s\S]*?\}[\s\S]*?\};/m,
  `const checkOpen = async (studentVal: string, correctVal: string): Promise<number> => {
        const s = (studentVal || '').trim();
        const c = (correctVal || '').trim();
        if (!s || !c) return 0;
        try {
          return (await answersEqual(s, c)) ? 1 : 0;
        } catch (err) {
          return s.replace(/\\s/g, '').toLowerCase() === c.replace(/\\s/g, '').toLowerCase() ? 1 : 0;
        }
      };`
);

fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
