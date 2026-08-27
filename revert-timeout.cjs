const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

code = code.replace(
  /const checkOpen = async \(studentVal: string, correctVal: string\): Promise<number> => \{[\s\S]*?try \{[\s\S]*?const res = await Promise\.race\(\[[\s\S]*?answersEqual\(s, c\),[\s\S]*?new Promise<boolean>\(\(resolve\) => setTimeout\(\(\) => \{[\s\S]*?console\.warn\("ComputeEngine timeout fallback for:", s, c\);[\s\S]*?resolve\(s\.replace\(\/\\s\/g, ''\)\.toLowerCase\(\) === c\.replace\(\/\\s\/g, ''\)\.toLowerCase\(\)\);[\s\S]*?\}, 200\)\)[\s\S]*?\]\);[\s\S]*?return res \? 1 : 0;[\s\S]*?\} catch \(err\) \{[\s\S]*?console\.error\("ComputeEngine error:", err\);[\s\S]*?return s\.replace\(\/\\s\/g, ''\)\.toLowerCase\(\) === c\.replace\(\/\\s\/g, ''\)\.toLowerCase\(\) \? 1 : 0;[\s\S]*?\}[\s\S]*?\};/m,
  `const checkOpen = async (studentVal: string, correctVal: string): Promise<number> => {
        const s = (studentVal || '').trim();
        const c = (correctVal || '').trim();
        if (!s || !c) return 0;
        try {
          return (await answersEqual(s, c)) ? 1 : 0;
        } catch {
          return s.replace(/\\s/g, '').toLowerCase() === c.replace(/\\s/g, '').toLowerCase() ? 1 : 0;
        }
      };`
);

fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
