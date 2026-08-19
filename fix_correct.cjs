const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');
const searchStr = `Object.entries(answers).forEach(([k, v]) => {\n        }`;
const replaceStr = `Object.entries(answers).forEach(([k, v]) => {\n        if (v !== undefined) cleanAnswers[String(k)] = v;\n      }`;
code = code.replace(searchStr, replaceStr);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
