const fs = require('fs');

function patchTest() {
  let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf-8');
  
  // 1. When clicking a question, disable fast mode
  code = code.replace(
    /onClick=\{\(\) => setActiveQuestion\(i\)\}/g,
    "onClick={() => { setActiveQuestion(i); setIsFastAnswerModeOpen(false); }}"
  );
  
  // 2. Wrap main editor
  const mainEditorStart = `        {/* Main Editor */}
        <div className="flex-1 min-w-0 flex flex-col lg:flex-row overflow-hidden bg-[#0d0d0d]">`;
        
  const newMainEditorStart = `        {/* Main Editor */}
        {isFastAnswerModeOpen ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#121212] custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-black text-white">To'g'ri javoblarni tez kiritish</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
        ) : (
        <div className="flex-1 min-w-0 flex flex-col lg:flex-row overflow-hidden bg-[#0d0d0d]">`;

  code = code.replace(mainEditorStart, newMainEditorStart);
  
  const mainEditorEnd = `           </div>
        </div>
      </div>
    </div>,
    document.body
  );
}`;
  const newMainEditorEnd = `           </div>
        </div>
        )}
      </div>
    </div>,
    document.body
  );
}`;
  code = code.replace(mainEditorEnd, newMainEditorEnd);
  
  fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code);
}

patchTest();
