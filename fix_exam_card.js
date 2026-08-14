import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentExams.tsx', 'utf8');

// The broken string is crazy, so let's just find the closing bracket before it and the open button tag after it.
const regex = /\{\(\(exam\.isOnline.*?<button/s;

code = code.replace(regex, `{((exam.isOnline || (exam.testSources && exam.testSources.length > 0) || exam.testId) && !isPast) && (\n        <button`);

fs.writeFileSync('src/pages/student/StudentExams.tsx', code);
