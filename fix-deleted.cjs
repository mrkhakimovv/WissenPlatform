const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

// Replace the broken fetchTest and missing handleSubmit
const brokenSection = `      } catch (e: any) {
      console.error("SUBMIT ERROR:", e);
      toast.error("Xatolik yuz berdi: " + (e.message || String(e)));
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {`;

const fixedSection = `      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Testni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [exam.testId, onClose]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isSubmitting) {
        handleSubmit();
      }
      return;
    }
    const t = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, isSubmitting]);

  const handleSubmit = async () => {
    console.log("SUBMIT START");
    if (!testData || !user) return;
    setIsSubmitting(true);
    
    try {
      const q = query(collection(db, 'exam_results'), where('examId', '==', exam.id), where('studentId', '==', user.id));
      const existing = await getDocs(q);
      const attemptNum = existing.size + 1;
      
      const raschItems: number[] = [];
      let totalCorrect = 0;

      const checkOpen = async (studentVal: string, correctVal: string): Promise<number> => {
        const s = (studentVal || '').trim();
        const c = (correctVal || '').trim();
        if (!s || !c) return 0;
        try {
          return (await answersEqual(s, c)) ? 1 : 0;
        } catch (err) {
          return s.replace(/\\s/g, '').toLowerCase() === c.replace(/\\s/g, '').toLowerCase() ? 1 : 0;
        }
      };

      for (const q of testData.questions) {
        if (q.isOpenEnded) {
          const isA = await checkOpen(userAnswers[\`\${q.id}_0\`], q.subAnswers?.[0]?.correctAnswerText || '');
          raschItems.push(isA);
          totalCorrect += isA;
          
          const isB = await checkOpen(userAnswers[\`\${q.id}_1\`], q.subAnswers?.[1]?.correctAnswerText || '');
          raschItems.push(isB);
          totalCorrect += isB;
        } else {
          const ans = userAnswers[q.id];
          const isC = ans === q.correctOptionIndex ? 1 : 0;
          raschItems.push(isC);
          totalCorrect += isC;
        }
      }
      
      const timeSpent = (exam.duration * 60) - timeLeft;
      
      await addDoc(collection(db, 'exam_results'), {
        examId: exam.id,
        studentId: user.id,
        studentName: user.fullName,
        score: totalCorrect,
        total: testData.questions.length + testData.questions.filter(q => q.isOpenEnded).length, // approximate if parts count to 2, wait what was total? Let's say raschItems.length
        raschItems,
        timeSpent,
        attempts: attemptNum,
        submittedAt: new Date().toISOString()
      });
      
      toast.success("Imtihon topshirildi!");
      onClose();
    } catch (e: any) {
      console.error("SUBMIT ERROR:", e);
      toast.error("Xatolik yuz berdi: " + (e.message || String(e)));
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {`;

code = code.replace(brokenSection, fixedSection);
fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
