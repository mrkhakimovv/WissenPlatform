const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const targetStr = `    let s = 0;
    for (let idx = 0; idx < testData.questions.length; idx++) {
      const q = testData.questions[idx];
      const ans = answers[idx];
      if (q.isOpenEnded) {
        if (ans && q.correctAnswerText && await answersEqual(String(ans), String(q.correctAnswerText))) {
          s += 1;
        }
      } else {
        if (ans === q.correctOptionIndex) {
          s += 1;
        }
      }
    }`;

const newStr = `    let s = 0;
    const wrongAnswersData = [];
    for (let idx = 0; idx < testData.questions.length; idx++) {
      const q = testData.questions[idx];
      const ans = answers[idx];
      let isCorrect = false;
      if (q.isOpenEnded) {
        if (ans && q.correctAnswerText && await answersEqual(String(ans), String(q.correctAnswerText))) {
          isCorrect = true;
        }
      } else {
        if (ans === q.correctOptionIndex) {
          isCorrect = true;
        }
      }
      
      if (isCorrect) {
        s += 1;
      } else {
        wrongAnswersData.push({
          questionIndex: idx + 1,
          studentAnswer: ans,
          correctAnswer: q.isOpenEnded ? q.correctAnswerText : q.correctOptionIndex,
          isOpenEnded: q.isOpenEnded,
          options: q.options || []
        });
      }
    }`;

code = code.replace(targetStr, newStr);

// Also add to addDoc
const targetDoc = `      await addDoc(collection(db, 'exam_results'), {
        examId: exam.id,
        testId: exam.testId || exam.id,
        studentId: user?.id || 'unknown_student',
        studentName: user?.fullName || 'Unknown',
        groupId: user?.groupId || null,
        score: s,
        total: testData.questions.length,
        answers: cleanAnswers,
        timeSpent: (exam.duration * 60) - timeLeft,
        attempts: attemptsCount + 1,
        submittedAt: new Date().toISOString()
      });`;

const newDoc = `      await addDoc(collection(db, 'exam_results'), {
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

code = code.replace(targetDoc, newDoc);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
