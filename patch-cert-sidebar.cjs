const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateBuilder.tsx', 'utf-8');

// 1. Add state for the modal
const stateToInsert = `  const [activeQuestion, setActiveQuestion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFastAnswerModeOpen, setIsFastAnswerModeOpen] = useState(false);`;

code = code.replace(
  `  const [activeQuestion, setActiveQuestion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);`,
  stateToInsert
);

// 2. Add the button in the sidebar
const sidebarCode = `        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col overflow-y-auto custom-scrollbar p-2 gap-1">
          {testData.questions.map((q, i) => {`;

const newSidebarCode = `        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col p-2 gap-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
          {testData.questions.map((q, i) => {`;

code = code.replace(sidebarCode, newSidebarCode);

const sidebarEnd = `              </button>
            );
          })}
        </div>`;

const newSidebarEnd = `              </button>
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
        </div>`;

code = code.replace(sidebarEnd, newSidebarEnd);

// 3. Add the modal at the bottom
const modalCode = `      {/* Fast Answer Modal */}
      {isFastAnswerModeOpen && (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex flex-col animate-in fade-in zoom-in-95 duration-200 p-6 md:p-12">
          <div className="bg-[#121212] flex-1 rounded-2xl flex flex-col overflow-hidden max-w-5xl mx-auto w-full border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0a0a0a]">
              <h2 className="text-lg font-black text-white">To'g'ri javoblarni tez kiritish</h2>
              <button onClick={() => setIsFastAnswerModeOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {testData.questions.map((q, i) => (
                  <div key={q.id} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10 relative">
                    <span className="font-bold text-white/70 text-lg">{i + 1}-savol</span>
                    {q.isOpenEnded ? (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FEC204] font-bold">a)</span>
                          <div className="flex-1 min-w-0">
                            <MathAnswerField
                              value={q.subAnswers?.[0]?.correctAnswerText || ''}
                              onChange={(val) => updateSubAnswer(i, 0, val)}
                              placeholder="Javob..."
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#FEC204] font-bold">b)</span>
                          <div className="flex-1 min-w-0">
                            <MathAnswerField
                              value={q.subAnswers?.[1]?.correctAnswerText || ''}
                              onChange={(val) => updateSubAnswer(i, 1, val)}
                              placeholder="Javob..."
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1 sm:gap-1.5 xl:gap-2 w-full justify-center flex-wrap">
                        {q.options.map((_, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => updateQuestion(i, 'correctOptionIndex', optIndex)}
                            className={\`w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 text-xs sm:text-sm xl:text-base shrink-0 rounded-full font-bold transition-colors flex items-center justify-center \${q.correctOptionIndex === optIndex ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white hover:bg-white/20'}\`}
                          >
                            {ALPHABET[optIndex]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(`    </div>\n  );\n}`, modalCode);

fs.writeFileSync('src/pages/admin/AdminCertificateBuilder.tsx', code);
