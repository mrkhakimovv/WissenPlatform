const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');
code = code.replace(/attempts,\n\s*submittedAt:/g, "attempts: attemptsCount + 1,\n        submittedAt:");
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
