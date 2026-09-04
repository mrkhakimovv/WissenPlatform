const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');

const startMarker = '<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">';
const endMarker = '{/* Main Editor */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = `${startMarker}
              {testData.questions.map((q, i) => (
                  <div key={q.id} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10 relative">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white/70 text-lg">{i + 1}-savol</span>
                      <button 
                        onClick={() => updateQuestion(i, 'isOpenEnded', !q.isOpenEnded)}
                        className={\`p-1.5 rounded-md transition-colors \${q.isOpenEnded ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}\`}
                        title={q.isOpenEnded ? "Test turiga o'tkazish" : "Yopiq savol (matnli) ga o'tkazish"}
                      >
                        <Type size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2 w-full justify-center">
                      {q.isOpenEnded ? (
                        <MathAnswerField
                          value={q.correctAnswerText || ''}
                          onChange={(latex) => updateQuestion(i, 'correctAnswerText', latex)}
                          placeholder="Javob"
                        />
                      ) : (
                        Array.from({length: testData.variantCount}).map((_, optIdx) => (
                          <button 
                            key={optIdx}
                            onClick={() => updateQuestion(i, 'correctOptionIndex', optIdx)}
                            className={\`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 \${q.correctOptionIndex === optIdx ? 'border-[#FEC204] bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)] scale-110' : 'border-white/20 text-white/40 hover:border-white/50 hover:text-white'}\`}
                          >
                            {ALPHABET[optIdx]}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col p-2 gap-1 overflow-hidden shrink-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
              {testData.questions.map((q, i) => {
                const isRealExam = testData.satType === 'SAT real EXAM';
                const showModule1 = isRealExam && i === 0;
                const showModule2 = isRealExam && i === 22;
                return (
                  <React.Fragment key={q.id}>
                    {showModule1 && <div className="text-[10px] uppercase font-black text-white/40 tracking-wider px-3 pt-3 pb-1">Modul 1 (1-22)</div>}
                    {showModule2 && <div className="text-[10px] uppercase font-black text-white/40 tracking-wider px-3 pt-4 pb-1">Modul 2 (23-44)</div>}
                    <button
                      onClick={() => { setActiveQuestion(i); setIsFastAnswerModeOpen(false); }}
                      className={\`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors shrink-0 \${activeQuestion === i ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}\`}
                    >
                      <span className="font-bold text-sm">Savol {i + 1}</span>
                      {q.text.trim() && <CheckCircle2 size={14} className="text-[#FEC204]" />}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 shrink-0">
              <button 
                onClick={() => setIsFastAnswerModeOpen(true)}
                className="w-full py-3 px-4 bg-[#FEC204]/10 text-[#FEC204] hover:bg-[#FEC204]/20 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> To'g'ri javoblar
              </button>
            </div>
          </div>
          
          `;
    code = code.substring(0, startIndex) + newContent + code.substring(endIndex);
    fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code);
    console.log("Success");
} else {
    console.log("Failed to find markers");
}
