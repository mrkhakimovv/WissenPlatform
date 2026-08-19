const fs = require('fs');
let code = fs.readFileSync('src/components/ExamStatsModal.tsx', 'utf-8');

const targetStr = `  const getWrongAnswers = (result: any) => {
    // Agar resultda to'g'ridan-to'g'ri wrongAnswers saqlangan bo'lsa (yangi versiya)
    if (result.wrongAnswers && Array.isArray(result.wrongAnswers)) {
      return result.wrongAnswers.map((w: any) => w.questionIndex);
    }
    // Eski versiya
    if (!testData || !result.answers) return [];
    const wrong: number[] = [];
    testData.questions.forEach((q: any, idx: number) => {
      const ans = result.answers[idx];
      if (q.isOpenEnded) {
        if (String(ans).trim() !== String(q.correctAnswerText).trim()) {
          wrong.push(idx + 1);
        }
      } else {
        if (ans !== q.correctOptionIndex) {
          wrong.push(idx + 1);
        }
      }
    });
    return wrong;
  };`;

const newStr = `  const getWrongAnswers = (result: any) => {
    // Agar resultda to'g'ridan-to'g'ri wrongAnswers saqlangan bo'lsa (yangi versiya)
    if (result.wrongAnswers && Array.isArray(result.wrongAnswers)) {
      return result.wrongAnswers.map((w: any) => w.questionIndex);
    }
    // Eski versiya
    if (!testData || !result.answers) return [];
    const wrong: number[] = [];
    testData.questions.forEach((q: any, idx: number) => {
      const ans = result.answers[idx];
      
      // We also need to check if the student missed the question entirely
      if (ans === undefined || ans === null) {
        wrong.push(idx + 1);
        return;
      }
      
      if (q.isOpenEnded) {
        if (String(ans).trim() !== String(q.correctAnswerText).trim()) {
          wrong.push(idx + 1);
        }
      } else {
        if (ans !== q.correctOptionIndex) {
          wrong.push(idx + 1);
        }
      }
    });
    return wrong;
  };`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/ExamStatsModal.tsx', code);
