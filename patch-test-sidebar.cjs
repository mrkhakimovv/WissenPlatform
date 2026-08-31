const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf-8');

// 1. Add state for the modal
const stateToInsert = `  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFastAnswerModeOpen, setIsFastAnswerModeOpen] = useState(false);`;

code = code.replace(
  `  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);`,
  stateToInsert
);

// 2. Add the button in the sidebar
const sidebarCode = `        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col overflow-y-auto custom-scrollbar p-2 gap-1">
          {testData.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setActiveQuestion(i)}
              className={\`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors \${activeQuestion === i ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}\`}
            >
              <span className="font-bold text-sm">Savol {i + 1}</span>
              {q.text.trim() && <CheckCircle2 size={14} className="text-[#FEC204]" />}
            </button>
          ))}
        </div>`;

const newSidebarCode = `        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col p-2 gap-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {testData.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setActiveQuestion(i)}
                className={\`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors shrink-0 \${activeQuestion === i ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}\`}
              >
                <span className="font-bold text-sm">Savol {i + 1}</span>
                {q.text.trim() && <CheckCircle2 size={14} className="text-[#FEC204]" />}
              </button>
            ))}
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

code = code.replace(sidebarCode, newSidebarCode);

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
                    <div className="flex gap-2 w-full justify-center">
                        {Array.from({length: testData.variantCount}).map((_, optIdx) => (
                          <button 
                            key={optIdx}
                            onClick={() => updateQuestion(i, 'correctOptionIndex', optIdx)}
                            className={\`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 \${q.correctOptionIndex === optIdx ? 'border-[#FEC204] bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)] scale-110' : 'border-white/20 text-white/40 hover:border-white/50 hover:text-white'}\`}
                          >
                            {ALPHABET[optIdx]}
                          </button>
                        ))}
                    </div>
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

fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code);
