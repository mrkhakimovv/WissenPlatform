const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

// 1. Add imports for icons used in lessons and Vocab Modal
code = code.replace(
  `import StudentTestTake from './StudentTestTake';`,
  `import StudentTestTake from './StudentTestTake';
import { Book, PlayCircle } from 'lucide-react';
import StudentVocabModal from './StudentVocabModal';`
);

// 2. Add state for vocab modal
code = code.replace(
  `  const [activeTab, setActiveTab] = useState<'lessons' | 'exams'>('exams');
  const [lessons, setLessons] = useState<any[]>([]);`,
  `  const [activeTab, setActiveTab] = useState<'lessons' | 'exams'>('exams');
  const [lessons, setLessons] = useState<any[]>([]);
  const [practicingVocab, setPracticingVocab] = useState<any>(null);`
);

// 3. Fix the conditional rendering in the return statement
const oldReturnContent = `      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">SAT Baza</h1>
          <p className="text-[12px] text-white/40 font-medium">Sizning kelgusi imtihon va darslaringiz</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-xl border border-white/5">
           <button 
             onClick={() => setActiveTab('lessons')}
             className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'lessons' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
           >
             Darslar
           </button>
           <button 
             onClick={() => setActiveTab('exams')}
             className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'exams' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
           >
             Imtihonlar
           </button>
        </div>
      </div>

      {upcomingExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">Kelgusi SAT Imtihonlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map(exam => renderExamCard(exam, false))}
          </div>
        </div>
      )}

      {pastExams.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">O'tgan SAT Imtihonlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastExams.map(exam => renderExamCard(exam, true))}
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📝</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali imtihonlar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Sizning guruhlaringiz uchun hali imtihonlar belgilanmagan.</p>
        </div>
      )}`;

const newReturnContent = `      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">
            {activeTab === 'exams' ? 'SAT Imtihonlar' : 'SAT Darslar'}
          </h1>
          <p className="text-[12px] text-white/40 font-medium">Sizning kelgusi imtihon va darslaringiz</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-xl border border-white/5 shrink-0">
           <button 
             onClick={() => setActiveTab('lessons')}
             className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'lessons' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
           >
             Darslar
           </button>
           <button 
             onClick={() => setActiveTab('exams')}
             className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'exams' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
           >
             Imtihonlar
           </button>
        </div>
      </div>

      {activeTab === 'exams' && (
        <>
          {upcomingExams.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">Kelgusi SAT Imtihonlar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingExams.map(exam => renderExamCard(exam, false))}
              </div>
            </div>
          )}

          {pastExams.length > 0 && (
            <div className="space-y-4 mt-8">
              <h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">O'tgan SAT Imtihonlar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastExams.map(exam => renderExamCard(exam, true))}
              </div>
            </div>
          )}

          {exams.length === 0 && (
            <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="text-[24px]">📝</span>
              </div>
              <h3 className="text-[18px] font-bold text-white mb-2">Hali imtihonlar yo'q</h3>
              <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Sizning guruhlaringiz uchun hali imtihonlar belgilanmagan.</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map(lesson => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={lesson.id} 
              className="glass-panel p-5 flex flex-col"
            >
              <h3 className="text-[18px] font-bold text-white mb-4">{lesson.title}</h3>
              <div className="mt-auto space-y-2">
                {lesson.homeworkTestId && (
                  <button 
                    onClick={() => {
                      setTakingExam({
                        id: lesson.id + '_hw',
                        title: lesson.title + ' - Uyga vazifa',
                        testId: lesson.homeworkTestId,
                        examType: 'sat',
                        subject: 'Homework',
                        date: new Date().toISOString(),
                        duration: 'Cheklanmagan',
                        location: 'Online',
                        groupId: ''
                      } as Exam);
                    }}
                    className="w-full py-3 rounded-xl font-bold bg-[rgba(254,194,4,0.15)] text-[#FEC204] hover:bg-[rgba(254,194,4,0.25)] transition-colors border border-[#FEC204]/20 flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={18} /> Uyga vazifani ishlash
                  </button>
                )}
                
                {(lesson.vocabularyEng || lesson.vocabularyUz) && (
                  <button 
                    onClick={() => setPracticingVocab(lesson)}
                    className="w-full py-3 rounded-xl font-bold bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Book size={18} /> Lug'atlarni yodlash
                  </button>
                )}
                
                {!lesson.homeworkTestId && !lesson.vocabularyEng && !lesson.vocabularyUz && (
                  <div className="text-center py-2 text-white/40 text-xs font-bold uppercase tracking-wider">
                    Vazifalar kiritilmagan
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {lessons.length === 0 && (
            <div className="col-span-full glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="text-[24px]">📚</span>
              </div>
              <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar yo'q</h3>
              <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Sizning guruhlaringiz uchun hali darslar faollashtirilmagan.</p>
            </div>
          )}
        </div>
      )}`;

code = code.replace(oldReturnContent, newReturnContent);

// Add vocab modal rendering
code = code.replace(
  `{takingExam && (`,
  `{practicingVocab && (
        <StudentVocabModal lesson={practicingVocab} onClose={() => setPracticingVocab(null)} />
      )}
      {takingExam && (`
);

fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
