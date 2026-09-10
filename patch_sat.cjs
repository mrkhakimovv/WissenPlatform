const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

// 1. Fix the cleanup function for unsubResults
const cleanupRegex = /return \(\) => \{\s*unsubLessons\(\);\s*unsubExams\(\);\s*\/\/[^\n]*\n\s*\};/;
code = code.replace(cleanupRegex, `return () => {
      unsubLessons();
      unsubExams();
      if (typeof unsubResults === 'function') unsubResults();
    };`);

const unsubRegex = /if \(user\?\.uid\) \{\s*const unsubResults = onSnapshot/;
code = code.replace(unsubRegex, `let unsubResults: any;
    if (user?.uid) {
      unsubResults = onSnapshot`);


// 2. Update the lesson card to show results and disable attempt
const regexLessonCard = /<div className="mt-auto space-y-2">([\s\S]*?)<\/div>\s*<\/motion\.div>/;
const match = code.match(regexLessonCard);

if (match) {
  const newCardLogic = `<div className="mt-auto space-y-2">
                {(() => {
                  if (!lesson.homeworkTestId) return null;
                  
                  const result = results.find(r => r.testId === lesson.homeworkTestId);
                  
                  if (result) {
                    return (
                      <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
                        <span className="text-[12px] font-bold text-white/50 uppercase tracking-widest">Natija</span>
                        <div className="flex items-end gap-1 text-[#FEC204]">
                          <span className="text-2xl font-black">{result.score}</span>
                          <span className="text-sm font-bold opacity-70 mb-1">/{result.totalQuestions}</span>
                        </div>
                        <p className="text-[11px] text-white/40 mt-1">Siz bu testni topshirgansiz</p>
                      </div>
                    );
                  }
                  
                  return (
                    <button 
                      onClick={() => {
                        setTakingExam({
                          id: lesson.id + '_hw',
                          title: lesson.title + ' - Uyga vazifa',
                          testId: lesson.homeworkTestId,
                          examType: 'sat',
                          subject: 'Homework',
                          date: new Date().toISOString(),
                          duration: 0,
                          location: 'Online',
                          groupId: ''
                        } as Exam);
                      }}
                      className="w-full py-3 rounded-xl font-bold bg-[rgba(254,194,4,0.15)] text-[#FEC204] hover:bg-[rgba(254,194,4,0.25)] transition-colors border border-[#FEC204]/20 flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={18} /> Uyga vazifani yuborish
                    </button>
                  );
                })()}
                
                {(lesson.vocabularyEng || lesson.vocabularyUz) && (
                  <button 
                    onClick={() => setPracticingVocab(lesson)}
                    className="w-full py-3 rounded-xl font-bold bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Book size={18} /> Lug'atlarni yodlash
                  </button>
                )}
              </div>
            </motion.div>`;
            
  code = code.replace(regexLessonCard, newCardLogic);
}

fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
