const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

code = code.replace(
  /const isA = console\.log\("Checking answer for q", q\.id\); await checkOpen\(userAnswers\[\`\$\{q\.id\}_0\`\], q\.subAnswers\?\.\[0\]\?\.correctAnswerText \|\| ''\);/g,
  `const isA = await checkOpen(userAnswers[\`\${q.id}_0\`], q.subAnswers?.[0]?.correctAnswerText || '');`
);

code = code.replace(
  /const isB = console\.log\("Checking answer for q", q\.id\); await checkOpen\(userAnswers\[\`\$\{q\.id\}_1\`\], q\.subAnswers\?\.\[1\]\?\.correctAnswerText \|\| ''\);/g,
  `const isB = await checkOpen(userAnswers[\`\${q.id}_1\`], q.subAnswers?.[1]?.correctAnswerText || '');`
);

fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
