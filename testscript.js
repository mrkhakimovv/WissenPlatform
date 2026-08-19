const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');
const startMatch = "const cleanAnswers: Record<string, any> = {};";
const endMatch = "await addDoc(collection(db, 'exam_results'), {";

const startIndex = code.indexOf(startMatch);
const endIndex = code.indexOf(endMatch);
if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `const cleanAnswers: Record<string, any> = {};
      Object.entries(answers).forEach(([k, v]) => {
        if (v !== undefined) cleanAnswers[String(k)] = v;
      });

      let attemptsCount = 0;
      try {
        const q = query(collection(db, 'exam_results'), where('examId', '==', exam.id), where('studentId', '==', user?.id));
        const snap = await getDocs(q);
        attemptsCount = snap.size;
      } catch (e) {
         console.warn("Failed to get previous attempts", e);
      }

      `;
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
}
