const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

code = code.replace(
  'if (snap.size >= (exam.maxAttempts || 1)) {',
  'const isAllowedRetake = exam.allowedRetakes?.includes(user?.id || "");\n      if (snap.size >= (exam.maxAttempts || 1) && !isAllowedRetake) {'
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
