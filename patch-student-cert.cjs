const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentMilliySertifikat.tsx', 'utf-8');

code = code.replace(
  'const ended = exam.status === \'ended\';',
  'const ended = exam.status === \'ended\';\n            const isAllowedRetake = exam.allowedRetakes?.includes(user?.id || "");'
);

code = code.replace(
  '{!result && !ended && (',
  '{!result && (!ended || isAllowedRetake) && ('
);

code = code.replace(
  '{!result && ended && (',
  '{!result && ended && !isAllowedRetake && ('
);

code = code.replace(
  '{result && ended && !myR && (',
  '{result && ended && !myR && !isAllowedRetake && ('
);

fs.writeFileSync('src/pages/student/StudentMilliySertifikat.tsx', code);
