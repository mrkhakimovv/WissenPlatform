const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// 1. Add states
code = code.replace(
  `  // SAT Exam form states`,
  `  // SAT Lessons states
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', homeworkKeys: '', vocabulary: '' });

  // SAT Exam form states`
);

// 2. Add onSnapshot for lessons
code = code.replace(
  `    const unsubExams = onSnapshot(query(collection(db, 'exams'), orderBy('createdAt', 'desc')), snap => {
      const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      setSatExams(allExams.filter(e => e.examType === 'sat'));
    });`,
  `    const unsubExams = onSnapshot(query(collection(db, 'exams'), orderBy('createdAt', 'desc')), snap => {
      const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      setSatExams(allExams.filter(e => e.examType === 'sat'));
    });

    const unsubLessons = onSnapshot(collection(db, 'sat_lessons'), snap => {
      setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });`
);

// 3. Add to cleanup
code = code.replace(
  `return () => { unsubSubjects(); unsubExams(); };`,
  `return () => { unsubSubjects(); unsubExams(); unsubLessons(); };`
);

// 4. Add handlers
const lessonHandlers = `
  const handleLessonSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title) {
      toast.error("Dars nomini kiriting");
      return;
    }
    try {
      await addDoc(collection(db, 'sat_lessons'), {
        ...lessonForm,
        createdAt: new Date().toISOString()
      });
      setIsLessonModalOpen(false);
      setLessonForm({ title: '', homeworkKeys: '', vocabulary: '' });
      toast.success("Dars qo'shildi");
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleLessonDelete = async (id: string) => {
    if (await confirm("Haqiqatan ham bu darsni o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, 'sat_lessons', id));
        toast.success("Dars o'chirildi");
      } catch (error) {
        console.error(error);
        toast.error("Xatolik yuz berdi");
      }
    }
  };
`;
code = code.replace(`  const handleAssignClick = (t: TestData) => {`, lessonHandlers + `\n  const handleAssignClick = (t: TestData) => {`);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
