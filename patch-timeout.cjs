const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

code = code.replace(
  /const checkOpen = async/g,
  `const checkOpen = async` // reset if any
);

code = code.replace(
  /const checkOpen = async \(studentVal: string, correctVal: string\): Promise<number> => \{[\s\S]*?try \{[\s\S]*?return \(await answersEqual\(s, c\)\) \? 1 : 0;[\s\S]*?\} catch \{[\s\S]*?return s\.toLowerCase\(\) === c\.toLowerCase\(\) \? 1 : 0;[\s\S]*?\}[\s\S]*?\};/m,
  `const checkOpen = async (studentVal: string, correctVal: string): Promise<number> => {
        const s = (studentVal || '').trim();
        const c = (correctVal || '').trim();
        if (!s || !c) return 0;
        try {
          const res = await Promise.race([
            answersEqual(s, c),
            new Promise<boolean>((resolve) => setTimeout(() => {
              console.warn("ComputeEngine timeout fallback for:", s, c);
              resolve(s.replace(/\\s/g, '').toLowerCase() === c.replace(/\\s/g, '').toLowerCase());
            }, 1000))
          ]);
          return res ? 1 : 0;
        } catch (err) {
          console.error("ComputeEngine error:", err);
          return s.replace(/\\s/g, '').toLowerCase() === c.replace(/\\s/g, '').toLowerCase() ? 1 : 0;
        }
      };`
);

fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
