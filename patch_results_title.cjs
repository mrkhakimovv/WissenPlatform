const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const targetDocData = `      const docData = JSON.parse(JSON.stringify({
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
      }));`;

const newDocData = `      const docData = JSON.parse(JSON.stringify({
        examId: exam.id,
        examTitle: exam.title || "Noma'lum imtihon",
        examSubject: exam.subject || '',
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
      }));`;

code = code.replace(targetDocData, newDocData);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);

let code2 = fs.readFileSync('src/pages/student/StudentResults.tsx', 'utf-8');

const targetResData = `        const resData = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            examTitle: examsMap.get(data.examId)?.title || "Noma'lum imtihon",
            examSubject: examsMap.get(data.examId)?.subject || '',
            examDate: examsMap.get(data.examId)?.date || '',
            examTestId: examsMap.get(data.examId)?.testId || null,
          };
        });`;

const newResData = `        const resData = snap.docs.map(d => {
          const data = d.data();
          // Prefer saved title/subject, fallback to map if it exists
          return {
            id: d.id,
            ...data,
            examTitle: data.examTitle || examsMap.get(data.examId)?.title || "Noma'lum imtihon",
            examSubject: data.examSubject || examsMap.get(data.examId)?.subject || '',
            examDate: data.examDate || examsMap.get(data.examId)?.date || data.submittedAt || '',
            examTestId: data.testId || examsMap.get(data.examId)?.testId || null,
          };
        });`;

code2 = code2.replace(targetResData, newResData);
fs.writeFileSync('src/pages/student/StudentResults.tsx', code2);
