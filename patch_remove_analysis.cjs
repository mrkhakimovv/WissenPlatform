const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const targetToRemove = `          <div className="w-full text-left bg-[#1a1a1a] rounded-[16px] mb-6 overflow-hidden">
            <h3 className="px-4 py-3 border-b border-white/10 text-sm font-bold text-white">To'g'ri javoblar kaliti va tahlil</h3>
            <div className="max-h-[35vh] overflow-y-auto custom-scrollbar p-2">
              {allResultsList.map((w, i) => (
                <div key={i} className={\`mb-2 p-3 border rounded-xl \${w.isCorrect ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}\`}>
                  <div className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                    {w.questionIndex}-savol 
                    {w.isCorrect ? <span className="text-green-500 text-xs">(To'g'ri)</span> : <span className="text-red-500 text-xs">(Xato)</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="p-2 bg-[#0d0d0d] rounded-lg">
                      <div className="text-white/40 mb-1">Sizning javobingiz:</div>
                      <div className={\`font-medium break-all \${w.isCorrect ? 'text-green-400' : 'text-red-400'}\`}>
                        {(w.studentAnswer === undefined || w.studentAnswer === null) ? 'Belgilanmagan' : (w.isOpenEnded ? w.studentAnswer : (w.options[w.studentAnswer] || ['A','B','C','D'][w.studentAnswer]))}
                      </div>
                    </div>
                    <div className="p-2 bg-[#0d0d0d] rounded-lg">
                      <div className="text-white/40 mb-1">To'g'ri javob kaliti:</div>
                      <div className="text-green-400 font-medium break-all">
                        {w.isOpenEnded ? w.correctAnswer : (w.options[w.correctAnswer] || ['A','B','C','D'][w.correctAnswer])}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>`;

code = code.replace(targetToRemove, '');

code = code.replace(
  `          <button onClick={() => { if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); onClose(); }} className="w-full py-3 md:py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
            Ortga qaytish
          </button>`,
  `          <button onClick={() => { if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); onClose(); }} className="w-full py-3 md:py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
            Bosh sahifaga qaytish
          </button>`
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
