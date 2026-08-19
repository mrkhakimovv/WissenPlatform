const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// The error could be that inside `wrongAnswersData` or `allAnswersData`, something is `undefined`.
// Let's stringify and parse the object to forcefully strip any remaining undefined.
const targetDoc = `      await addDoc(collection(db, 'exam_results'), {
        examId: exam.id,
        testId: exam.testId || exam.id,
        studentId: user?.id || 'unknown_student',
        studentName: user?.fullName || 'Unknown',
        groupId: user?.groupId || null,
        score: s,
        total: testData.questions.length,
        answers: cleanAnswers,
        wrongAnswers: wrongAnswersData,
        timeSpent: (exam.duration * 60) - timeLeft,
        attempts: attemptsCount + 1,
        submittedAt: new Date().toISOString()
      });`;

const newDoc = `      // Sanitize undefined values before saving to Firestore
      const docData = JSON.parse(JSON.stringify({
        examId: exam.id,
        testId: exam.testId || exam.id,
        studentId: user?.id || 'unknown_student',
        studentName: user?.fullName || 'Unknown',
        groupId: user?.groupId || null,
        score: s,
        total: testData.questions.length,
        answers: cleanAnswers,
        wrongAnswers: wrongAnswersData,
        timeSpent: (exam.duration * 60) - timeLeft,
        attempts: attemptsCount + 1,
        submittedAt: new Date().toISOString()
      }));

      await addDoc(collection(db, 'exam_results'), docData);`;

code = code.replace(targetDoc, newDoc);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
