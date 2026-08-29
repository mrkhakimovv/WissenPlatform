import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { TestData, Exam } from '../types';
import { itemDifficultiesFromMatrix, generateSyntheticMatrix, seedFromString } from './synthetic';
import { computeRaschWithReference, computeRaschReport, dedupeBestAttempts } from './rasch';
import { answersEqual } from '../components/MathAnswerField';

// For Certificate (Rasch) exams
export async function recalculateCertificateExams(testData: TestData) {
  const examsSnap = await getDocs(query(collection(db, 'exams'), where('testId', '==', testData.id), where('examType', '==', 'certificate')));
  
  for (const examDoc of examsSnap.docs) {
    const exam = { id: examDoc.id, ...examDoc.data() } as Exam;
    
    // 1. Fetch all results for this exam
    const resultsSnap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', exam.id)));
    const results = resultsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    
    let needsExamUpdate = false;
    
    for (const res of results) {
       // Re-evaluate if `answers` object exists
       if (res.answers) {
         const userAnswers = res.answers;
         const raschItems: number[] = [];
         let totalCorrect = 0;
         
         const checkOpen = async (studentVal: string, correctVal: string): Promise<number> => {
           const s = (studentVal || '').trim();
           const c = (correctVal || '').trim();
           if (!s || !c) return 0;
           try {
             return (await answersEqual(s, c)) ? 1 : 0;
           } catch (err) {
             return s.replace(/\s/g, '').toLowerCase() === c.replace(/\s/g, '').toLowerCase() ? 1 : 0;
           }
         };

         for (const q of testData.questions) {
           if (q.isOpenEnded) {
             const isA = await checkOpen(userAnswers[`${q.id}_0`], q.subAnswers?.[0]?.correctAnswerText || '');
             raschItems.push(isA);
             totalCorrect += isA;
             
             const isB = await checkOpen(userAnswers[`${q.id}_1`], q.subAnswers?.[1]?.correctAnswerText || '');
             raschItems.push(isB);
             totalCorrect += isB;
           } else {
             const ans = userAnswers[q.id];
             const isC = ans === q.correctOptionIndex ? 1 : 0;
             raschItems.push(isC);
             totalCorrect += isC;
           }
         }
         
         // Update if changed
         if (JSON.stringify(raschItems) !== JSON.stringify(res.raschItems) || res.score !== totalCorrect) {
            await updateDoc(doc(db, 'exam_results', res.id), {
              raschItems,
              score: totalCorrect,
              total: raschItems.length
            });
            // Update the local object for report recalculation
            res.raschItems = raschItems;
            res.score = totalCorrect;
            needsExamUpdate = true;
         }
       }
    }
    
    // 2. Re-calculate Rasch report if exam is ended and there were updates (or just if ended to be safe)
    if (exam.status === 'ended' && needsExamUpdate) {
        const best = dedupeBestAttempts(results.filter((r: any) => Array.isArray(r.raschItems) && r.raschItems.length > 0));
        
        if (best.length > 0) {
           const numItems = best[0].raschItems.length;
           const validResults = best.filter((r: any) => r.raschItems.length === numItems);
           const matrix = validResults.map((r: any) => ({ studentId: r.studentId, studentName: r.studentName, items: r.raschItems }));
           
           let report;
           const synCount = exam.syntheticEnabled ? Math.max(0, Math.floor(exam.syntheticCount || 0)) : 0;
           if (synCount > 0) {
             const difficulties = itemDifficultiesFromMatrix(matrix);
             const synthetic = generateSyntheticMatrix(difficulties, {
               count: synCount,
               seed: seedFromString(exam.id)
             });
             report = computeRaschWithReference(matrix, synthetic);
           } else {
             report = computeRaschReport(matrix);
           }
           
           await updateDoc(doc(db, 'exams', exam.id), {
             raschReport: report
           });
        }
    }
  }
}

// For standard/SAT exams
export async function recalculateStandardExams(testData: TestData) {
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
          s++;
        }
      }
      
      if (s !== res.score || JSON.stringify(wrongAnswersData) !== JSON.stringify(res.wrongAnswers)) {
         await updateDoc(doc(db, 'exam_results', resDoc.id), {
            score: s,
            total: testData.questions.length,
            wrongAnswers: wrongAnswersData
         });
      }
    }
  }
}
