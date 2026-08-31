const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');

const oldCode = `  const [testData, setTestData] = useState<TestData>(initialData);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize questions if empty
  if (testData.questions.length === 0) {
    const initialQuestions = Array.from({ length: testData.questionCount }).map((_, i) => ({
      id: Math.random().toString(),
      text: '',
      options: Array(testData.variantCount).fill(''),
      correctOptionIndex: 0
    }));
    setTestData({ ...testData, questions: initialQuestions });
  }`;

const newCode = `  const [testData, setTestData] = useState<TestData>(() => {
    if (initialData.questions.length === 0) {
      const initialQuestions = Array.from({ length: initialData.questionCount }).map((_, i) => ({
        id: Math.random().toString(),
        text: '',
        options: Array(initialData.variantCount).fill(''),
        correctOptionIndex: 0
      }));
      return { ...initialData, questions: initialQuestions };
    }
    return initialData;
  });
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code);
