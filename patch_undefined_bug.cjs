const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const targetStr = `      allAnswersData.push({
        questionIndex: idx + 1,
        isCorrect,
        studentAnswer: ans,
        correctAnswer: q.isOpenEnded ? q.correctAnswerText : q.correctOptionIndex,
        isOpenEnded: q.isOpenEnded,
        options: q.options || []
      });
      
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
      }`;

const newStr = `      allAnswersData.push({
        questionIndex: idx + 1,
        isCorrect,
        studentAnswer: ans === undefined ? null : ans,
        correctAnswer: q.isOpenEnded ? (q.correctAnswerText || null) : (q.correctOptionIndex !== undefined ? q.correctOptionIndex : null),
        isOpenEnded: !!q.isOpenEnded,
        options: q.options || []
      });
      
      if (isCorrect) {
        s += 1;
      } else {
        wrongAnswersData.push({
          questionIndex: idx + 1,
          studentAnswer: ans === undefined ? null : ans,
          correctAnswer: q.isOpenEnded ? (q.correctAnswerText || null) : (q.correctOptionIndex !== undefined ? q.correctOptionIndex : null),
          isOpenEnded: !!q.isOpenEnded,
          options: q.options || []
        });
      }`;

code = code.replace(targetStr, newStr);

// Also check the UI rendering where we used studentAnswer === undefined, replace with studentAnswer === null
const targetUI = `w.studentAnswer === undefined ? 'Belgilanmagan'`;
const newUI = `(w.studentAnswer === undefined || w.studentAnswer === null) ? 'Belgilanmagan'`;

code = code.replaceAll(targetUI, newUI);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
