import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentExams.tsx', 'utf8');

code = code.replace(
  /\{\(\(exam\.isOnline.*?&& \!isPast\).*?\(/, 
  '{((exam.isOnline || (exam.testSources && exam.testSources.length > 0) || exam.testId) && !isPast) && ('
);

fs.writeFileSync('src/pages/student/StudentExams.tsx', code);
