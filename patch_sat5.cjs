const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// We need a state for the lesson being edited for vocabulary
code = code.replace(
  `  // SAT Lessons states
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', homeworkKeys: '', vocabulary: '' });`,
  `  // SAT Lessons states
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', homeworkKeys: '', vocabulary: '' });
  
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [vocabForm, setVocabForm] = useState({ id: '', vocabulary: '' });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);`
);

// We need logic to handle vocab save
const vocabHandler = `
  const handleVocabSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabForm.id) return;
    try {
      await updateDoc(doc(db, 'sat_lessons', vocabForm.id), { vocabulary: vocabForm.vocabulary });
      setIsVocabModalOpen(false);
      toast.success("Lug'atlar saqlandi");
    } catch(err) {
      toast.error("Xatolik");
    }
  };

  const handleHomeworkClick = (lesson: any) => {
    setEditingLessonId(lesson.id);
    if (lesson.homeworkTestId) {
      // Find the test
      const test = tests.find(t => t.id === lesson.homeworkTestId);
      if (test) {
        setTestConfig(test);
        setIsTestBuilderOpen(true);
      } else {
        toast.error("Test topilmadi, ehtimol o'chirilgan.");
      }
    } else {
      setTestConfig({
        title: lesson.title + ' - Uyga vazifa',
        questionCount: 10,
        variantCount: 4,
        testType: 'sat',
        satType: 'SAT Homework',
        isFastMode: true,
        questions: [],
        createdAt: ''
      });
      setIsTestBuilderOpen(true);
    }
  };
`;
code = code.replace(`  const handleLessonDelete = async (id: string) => {`, vocabHandler + `\n  const handleLessonDelete = async (id: string) => {`);

// Also update the onSave of AdminSATBuilder
const builderJSXOld = `      {isTestBuilderOpen && (
        <AdminSATBuilder 
          initialData={testConfig} 
          onClose={() => setIsTestBuilderOpen(false)} 
          onSave={() => { 
            // Saved
         }} 
        />
      )}`;

const builderJSXNew = `      {isTestBuilderOpen && (
        <AdminSATBuilder 
          initialData={testConfig} 
          onClose={() => {
            setIsTestBuilderOpen(false);
            setEditingLessonId(null);
          }} 
          onSave={async (savedTest) => { 
            if (activeTab === 'lessons' && editingLessonId && savedTest) {
              try {
                await updateDoc(doc(db, 'sat_lessons', editingLessonId), { homeworkTestId: savedTest.id });
              } catch(e) {
                console.error(e);
              }
            }
         }} 
        />
      )}`;
code = code.replace(builderJSXOld, builderJSXNew);

// Add Vocab modal
const vocabModal = `      {isVocabModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-[20px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-black tracking-tight text-white">Lug'atlarni kiritish</h2>
              <button onClick={() => setIsVocabModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleVocabSave} className="space-y-4">
              <div>
                <textarea rows={8} placeholder="So'zlarni bu yerga kiriting..." value={vocabForm.vocabulary} onChange={e => setVocabForm({...vocabForm, vocabulary: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white resize-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsVocabModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;
code = code.replace(`    </div>\n  );\n}`, vocabModal + `    </div>\n  );\n}`);

// Now modify the lesson card to show the buttons
const lessonCardOld = `                      <h3 className="text-[16px] font-bold text-[#FEC204] mb-4">{lesson.title}</h3>
                      {lesson.homeworkKeys && (
                        <div className="mb-3">
                          <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Uyga vazifaning javob kalitlari</p>
                          <p className="text-white/80 text-sm line-clamp-2">{lesson.homeworkKeys}</p>
                        </div>
                      )}
                      {lesson.vocabulary && (
                        <div>
                          <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Lug'atlar</p>
                          <p className="text-white/80 text-sm line-clamp-2">{lesson.vocabulary}</p>
                        </div>
                      )}`;

const lessonCardNew = `                      <h3 className="text-[16px] font-bold text-[#FEC204] mb-4">{lesson.title}</h3>
                      
                      <div className="flex flex-col gap-2 mt-4">
                        <button 
                          onClick={() => handleHomeworkClick(lesson)}
                          className="w-full py-2.5 rounded-lg border border-[#FEC204]/30 text-[#FEC204] font-bold text-sm hover:bg-[#FEC204]/10 transition-colors"
                        >
                          {lesson.homeworkTestId ? "Uyga vazifani tahrirlash" : "Uyga vazifa kiritish"}
                        </button>
                        <button 
                          onClick={() => {
                            setVocabForm({ id: lesson.id, vocabulary: lesson.vocabulary || '' });
                            setIsVocabModalOpen(true);
                          }}
                          className="w-full py-2.5 rounded-lg border border-white/10 text-white/70 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors"
                        >
                          Lug'atlarni {lesson.vocabulary ? 'tahrirlash' : 'kiritish'}
                        </button>
                      </div>`;

code = code.replace(lessonCardOld, lessonCardNew);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
