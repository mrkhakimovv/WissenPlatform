const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentExams.tsx', 'utf-8');

code = code.replace(
  'const canAttempt = attemptsCount < maxAttempts;',
  'const isAllowedRetake = exam.allowedRetakes?.includes(user?.id || "");\n    const canAttempt = attemptsCount < maxAttempts || isAllowedRetake;'
);

code = code.replace(
  'if (exam.status === \'ended\') {',
  'if (exam.status === \'ended\' && !isAllowedRetake) {'
);

code = code.replace(
  '(!canAttempt || exam.status === \'ended\') ?',
  '(!canAttempt || (exam.status === \'ended\' && !isAllowedRetake)) ?'
);

code = code.replace(
  '{exam.status === \'ended\' ? (',
  '{(exam.status === \'ended\' && !isAllowedRetake) ? ('
);

fs.writeFileSync('src/pages/student/StudentExams.tsx', code);
