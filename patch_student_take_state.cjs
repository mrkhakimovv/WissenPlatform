const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// Add wrong answers state
code = code.replace(
  "  const [submitted, setSubmitted] = useState(false);",
  "  const [submitted, setSubmitted] = useState(false);\n  const [wrongAnswersList, setWrongAnswersList] = useState<any[]>([]);"
);

// Update handleSubmit to set the state
const targetStr = `        wrongAnswersData.push({
          questionIndex: idx + 1,
          studentAnswer: ans,
          correctAnswer: q.isOpenEnded ? q.correctAnswerText : q.correctOptionIndex,
          isOpenEnded: q.isOpenEnded,
          options: q.options || []
        });
      }
    }
    setScore(s);`;
    
const newStr = `        wrongAnswersData.push({
          questionIndex: idx + 1,
          studentAnswer: ans,
          correctAnswer: q.isOpenEnded ? q.correctAnswerText : q.correctOptionIndex,
          isOpenEnded: q.isOpenEnded,
          options: q.options || []
        });
      }
    }
    setScore(s);
    setWrongAnswersList(wrongAnswersData);`;

code = code.replace(targetStr, newStr);

const targetSubmittedScreen = `          <div className="bg-white/5 border border-white/10 rounded-[16px] w-full p-5 md:p-6 mb-8">
            <div className="text-[40px] md:text-[48px] font-black text-[#FEC204] leading-none mb-2">
              {score} <span className="text-[18px] md:text-[20px] text-white/40">/ {testData.questions.length}</span>
            </div>
            <p className="text-[12px] md:text-[14px] font-bold text-white/60 uppercase tracking-widest">To'g'ri javoblar</p>
          </div>
          
          <button onClick={() => { if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); onClose(); }} className="w-full py-3 md:py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
            Ortga qaytish
          </button>
        </div>
      </div>,
      document.body
    )}</>;`;
    
const newSubmittedScreen = `          <div className="bg-white/5 border border-white/10 rounded-[16px] w-full p-5 md:p-6 mb-6">
            <div className="text-[40px] md:text-[48px] font-black text-[#FEC204] leading-none mb-2">
              {score} <span className="text-[18px] md:text-[20px] text-white/40">/ {testData.questions.length}</span>
            </div>
            <p className="text-[12px] md:text-[14px] font-bold text-white/60 uppercase tracking-widest">To'g'ri javoblar</p>
          </div>

          {wrongAnswersList.length > 0 && (
            <div className="w-full text-left bg-[#1a1a1a] rounded-[16px] mb-6 overflow-hidden">
              <h3 className="px-4 py-3 border-b border-white/10 text-sm font-bold text-white">Xato qilingan savollar</h3>
              <div className="max-h-[30vh] overflow-y-auto custom-scrollbar p-2">
                {wrongAnswersList.map((w, i) => (
                  <div key={i} className="mb-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <div className="font-bold text-white mb-2 text-sm">{w.questionIndex}-savol</div>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      <div className="p-2 bg-[#1a1a1a] rounded-lg">
                        <div className="text-white/40 mb-1">Sizning javobingiz:</div>
                        <div className="text-red-400 font-medium break-all">
                          {w.studentAnswer === undefined ? 'Belgilanmagan' : (w.isOpenEnded ? w.studentAnswer : (w.options[w.studentAnswer] || ['A','B','C','D'][w.studentAnswer]))}
                        </div>
                      </div>
                      <div className="p-2 bg-[#1a1a1a] rounded-lg">
                        <div className="text-white/40 mb-1">To'g'ri javob:</div>
                        <div className="text-green-400 font-medium break-all">
                          {w.isOpenEnded ? w.correctAnswer : (w.options[w.correctAnswer] || ['A','B','C','D'][w.correctAnswer])}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button onClick={() => { if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); onClose(); }} className="w-full py-3 md:py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
            Ortga qaytish
          </button>
        </div>
      </div>,
      document.body
    )}</>;`;

code = code.replace(targetSubmittedScreen, newSubmittedScreen);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
