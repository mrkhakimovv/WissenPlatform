const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');
code = code.replace(/Object\.entries\(answers\)\.forEach\(\(\[k, v\]\) => \{\s*\}\);/g, `Object.entries(answers).forEach(([k, v]) => {
        if (v !== undefined) cleanAnswers[String(k)] = v;
      });`);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
