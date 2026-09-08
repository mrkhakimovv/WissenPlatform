const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

const oldLessonsUI = `          {lessons.map(lesson => (
            <div key={lesson.id} className="glass-panel p-5 relative group border border-white/5 transition-colors">
              <h3 className="text-[16px] font-bold text-[#FEC204] mb-4">{lesson.title}</h3>
              {lesson.homeworkKeys && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Uyga vazifaning javob kalitlari</p>
                  <p className="text-white/80 text-sm whitespace-pre-wrap">{lesson.homeworkKeys}</p>
                </div>
              )}
              {lesson.vocabulary && (
                <div>
                  <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Lug'atlar</p>
                  <p className="text-white/80 text-sm whitespace-pre-wrap">{lesson.vocabulary}</p>
                </div>
              )}
            </div>
          ))}`;

const newLessonsUI = `          {lessons.map(lesson => {
            const hasHomework = !!lesson.homeworkTestId;
            const hasVocab = !!lesson.vocabulary;
            return (
              <div key={lesson.id} className="glass-panel p-5 relative group border border-white/5 transition-colors">
                <h3 className="text-[16px] font-bold text-[#FEC204] mb-4">{lesson.title}</h3>
                
                <div className="flex flex-col gap-2 mt-4">
                  {hasHomework && (
                    <button 
                      onClick={() => {
                         // We can open the test here directly via takingExam
                         // Let's find the test if needed, or we might need to load tests in the background
                         // For now, let's just make it a button that says "Uyga vazifani ishlash"
                         alert("Testni boshlash (Hali testlar yuklanishi kerak)");
                      }}
                      className="w-full py-2.5 rounded-lg border border-[#FEC204]/30 text-[#FEC204] font-bold text-sm hover:bg-[#FEC204]/10 transition-colors"
                    >
                      Uyga vazifani ishlash
                    </button>
                  )}
                  {hasVocab && (
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 mt-2">
                      <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Lug'atlar</p>
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{lesson.vocabulary}</p>
                    </div>
                  )}
                  {!hasHomework && !hasVocab && (
                    <p className="text-xs text-white/40">Hozircha materiallar yo'q</p>
                  )}
                </div>
              </div>
            );
          })}`;

code = code.replace(oldLessonsUI, newLessonsUI);
fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
