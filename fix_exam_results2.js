import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace(
  /await addDoc\(collection\(db, 'exam_results'\), \{/g,
  "await addDoc(collection(db, 'exam_results'), {"
);

code = code.replace(
  /testId: exam\.testId \|\| null,/g,
  "testId: exam.testId || exam.id,"
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
