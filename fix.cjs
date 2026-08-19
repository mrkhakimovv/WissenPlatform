const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const newCode = `  const handleSubmit = async () => {
    if (!testData || submitted) return;
    setSubmitted(true);
    let s = 0;
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
    }
    setScore(s);
    
    try {
      const cleanAnswers: Record<string, any> = {};
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

      await addDoc(collection(db, 'exam_results'), {
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
      });

      toast.success("Natija saqlandi!");
    } catch (err) {
      console.error('Error saving result:', err);
      toast.error("Natijani saqlashda xatolik yuz berdi!");
    }
  };`;

code = code.replace(/const handleSubmit = async \(\) => \{[\s\S]*?toast\.error\("Natijani saqlashda xatolik yuz berdi!"\);\n    \}\n  \};/, newCode);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
