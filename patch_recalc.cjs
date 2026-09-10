const fs = require('fs');
let code = fs.readFileSync('src/lib/recalculate.ts', 'utf-8');

const oldRecalc = `export async function recalculateStandardExams(testData: TestData) {
  const examsSnap = await getDocs(query(collection(db, 'exams'), where('testId', '==', testData.id)));
  
  for (const examDoc of examsSnap.docs) {
    const exam = { id: examDoc.id, ...examDoc.data() } as Exam;
    if (exam.examType === 'certificate') continue;
    
    const resultsSnap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', exam.id)));
    
    for (const resDoc of resultsSnap.docs) {
      const res = resDoc.data();
      if (!res.answers) continue; // No raw answers stored
      
      let s = 0;
      const wrongAnswersData = [];
      const answers = res.answers;
      
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
        
        if (!isCorrect) {
          wrongAnswersData.push({
            questionIndex: idx + 1,
            studentAnswer: ans === undefined ? null : ans,
            correctAnswer: q.isOpenEnded ? (q.correctAnswerText || null) : (q.correctOptionIndex !== undefined ? q.correctOptionIndex : null),
            isOpenEnded: !!q.isOpenEnded,
            options: q.options || []
          });
        } else {
          s += 1;
        }
      }
      
      await updateDoc(doc(db, 'exam_results', resDoc.id), {
        score: s,
        total: testData.questions.length,
        wrongAnswers: wrongAnswersData
      });
    }
  }
}`;

const newRecalc = `export async function recalculateStandardExams(testData: TestData) {
  // 1. Find standard exams using this test
  const examsSnap = await getDocs(query(collection(db, 'exams'), where('testId', '==', testData.id)));
  const examIds = examsSnap.docs.filter(d => d.data().examType !== 'certificate').map(d => d.id);
  
  // 2. Find homeworks using this test
  const lessonsSnap = await getDocs(query(collection(db, 'sat_lessons'), where('homeworkTestId', '==', testData.id)));
  const homeworkExamIds = lessonsSnap.docs.map(d => d.id + '_hw');

  const allTargetExamIds = [...examIds, ...homeworkExamIds];

  for (const examId of allTargetExamIds) {
    const resultsSnap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', examId)));
    
    for (const resDoc of resultsSnap.docs) {
      const res = resDoc.data();
      if (!res.answers) continue; // No raw answers stored
      
      let s = 0;
      const wrongAnswersData = [];
      const answers = res.answers;
      
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
        
        if (!isCorrect) {
          wrongAnswersData.push({
            questionIndex: idx + 1,
            studentAnswer: ans === undefined ? null : ans,
            correctAnswer: q.isOpenEnded ? (q.correctAnswerText || null) : (q.correctOptionIndex !== undefined ? q.correctOptionIndex : null),
            isOpenEnded: !!q.isOpenEnded,
            options: q.options || []
          });
        } else {
          s += 1;
        }
      }
      
      await updateDoc(doc(db, 'exam_results', resDoc.id), {
        score: s,
        total: testData.questions.length,
        wrongAnswers: wrongAnswersData
      });
    }
  }
}`;

code = code.replace(oldRecalc, newRecalc);

fs.writeFileSync('src/lib/recalculate.ts', code);
