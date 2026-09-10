const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

const regexLessonCard = /\{\(\(\) => \{\s*if \(\!lesson\.homeworkTestId\) return null;([\s\S]*?)\}\)\(\)\}/;

const newBlock = `{(() => {
                  if (!lesson.homeworkTestId) return null;
                  
                  const result = results.find(r => r.testId === lesson.homeworkTestId);
                  const testInfo = testsData[lesson.homeworkTestId];
                  
                  if (result) {
                    return (
                      <div className="w-full p-4 rounded-xl bg-[rgba(254,194,4,0.05)] border border-[#FEC204]/20 flex flex-col items-center justify-center gap-2">
                        <span className="text-[12px] font-bold text-[#FEC204] uppercase tracking-widest">Sizning Natijangiz</span>
                        <div className="flex items-end gap-1 text-white">
                          <span className="text-3xl font-black">{result.score}</span>
                          <span className="text-sm font-bold opacity-50 mb-1.5">/{result.total}</span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      {testInfo && (
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2.5 mt-2">
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-white/50 flex items-center gap-2">
                              <span className="text-[16px]">📝</span> Savollar soni
                            </span>
                            <span className="font-bold text-white">{testInfo.questions?.length || 0} ta</span>
                          </div>
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-white/50 flex items-center gap-2">
                              <span className="text-[16px]">⏱️</span> Ajratilgan vaqt
                            </span>
                            <span className="font-bold text-white">{testInfo.duration ? testInfo.duration + " daqiqa" : "Cheklanmagan"}</span>
                          </div>
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          setTakingExam({
                            id: lesson.id + '_hw',
                            title: lesson.title + ' - Uyga vazifa',
                            testId: lesson.homeworkTestId,
                            examType: 'sat',
                            subject: 'Homework',
                            date: new Date().toISOString(),
                            duration: testInfo?.duration || 0,
                            location: 'Online',
                            groupId: ''
                          } as Exam);
                        }}
                        className="w-full py-3.5 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_4px_14px_rgba(254,194,4,0.2)] flex items-center justify-center gap-2"
                      >
                        <PlayCircle size={18} /> Uyga vazifani boshlash
                      </button>
                    </div>
                  );
                })()}`;

code = code.replace(regexLessonCard, newBlock);
fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
