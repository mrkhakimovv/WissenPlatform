const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

code = code.replace(
  `alert("Testni boshlash (Hali testlar yuklanishi kerak)");`,
  `setTakingExam({ id: lesson.id, title: lesson.title + ' - Uyga vazifa', testId: lesson.homeworkTestId, isOnline: true } as unknown as Exam);`
);
fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
