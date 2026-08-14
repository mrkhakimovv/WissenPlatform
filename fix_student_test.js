import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const replacement = `
    const fetchTest = async () => {
      if (!exam.testId && (!exam.testSources || exam.testSources.length === 0)) {
        toast.error("Test topilmadi");
        onClose();
        return;
      }
      try {
        if (exam.testSources && exam.testSources.length > 0) {
          let combinedQuestions = [];
          let maxVariantCount = 3;
          for (const source of exam.testSources) {
            const d = await getDoc(doc(db, 'tests', source.testId));
            if (d.exists()) {
              const data = d.data();
              let qs = data.questions || [];
              if (data.variantCount > maxVariantCount) maxVariantCount = data.variantCount;
              // shuffle and slice
              qs = qs.sort(() => 0.5 - Math.random()).slice(0, source.count);
              combinedQuestions = [...combinedQuestions, ...qs];
            }
          }
          if (combinedQuestions.length === 0) {
            toast.error("Test savollari topilmadi");
            onClose();
            return;
          }
          // Mix all questions
          combinedQuestions = combinedQuestions.sort(() => 0.5 - Math.random());
          setTestData({
            title: exam.title,
            questionCount: combinedQuestions.length,
            variantCount: maxVariantCount,
            testType: exam.subject || 'Test',
            questions: combinedQuestions,
            createdAt: new Date().toISOString()
          });
        } else if (exam.testId) {
          const d = await getDoc(doc(db, 'tests', exam.testId));
          if (d.exists()) {
            setTestData({ id: d.id, ...d.data() } as TestData);
          } else {
            toast.error("Test bazada yo'q");
            onClose();
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Xatolik yuz berdi");
        onClose();
      } finally {
        setLoading(false);
      }
    };
`;

const regex = /const fetchTest = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};\s*fetchTest\(\);/m;

const fetchCall = `\n    fetchTest();\n`;

code = code.replace(regex, replacement + fetchCall);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
