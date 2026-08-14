import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace(
  /examId: exam\.id,\s*testId: exam\.testId \|\| null,\s*studentId: user\?\.id,\s*studentName: user\?\.fullName,\s*groupId: user\?\.groupId,/m,
  `examId: exam.id,
        testId: exam.testId || null,
        studentId: user?.id || null,
        studentName: user?.fullName || 'Unknown',
        groupId: user?.groupId || null,`
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
