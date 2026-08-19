const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');
code = code.replace(/        if \(v !== undefined\) cleanAnswers\[String\(k\)\] = v;\n      }/g, "      }");
code = code.replace(/        if \(v !== undefined\) cleanAnswers\[String\(k\)\] = v;/g, "        }");
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
