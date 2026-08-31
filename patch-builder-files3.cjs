const fs = require('fs');

function patchCert() {
  let code = fs.readFileSync('src/pages/admin/AdminCertificateBuilder.tsx', 'utf-8');
  
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
                    {q.isOpenEnded ? (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FEC204] font-bold">a)</span>
                          <div className="flex-1 min-w-0">
                            <MathAnswerField
                              value={q.subAnswers?.[0]?.correctAnswerText || ''}
                              onChange={(val) => updateSubAnswer(i, 0, val)}
                              placeholder="Javob"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#FEC204] font-bold">b)</span>
                          <div className="flex-1 min-w-0">
                            <MathAnswerField
                              value={q.subAnswers?.[1]?.correctAnswerText || ''}
                              onChange={(val) => updateSubAnswer(i, 1, val)}
                              placeholder="Javob"
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
        ) : (
        <div className="flex-1 min-w-0 flex flex-col lg:flex-row overflow-hidden bg-[#0d0d0d]">`;

  code = code.replace(mainEditorStart, newMainEditorStart);
  
  const mainEditorEnd = `           </div>
        </div>
      </div>
      )}
    </div>,
    document.body
  );
}`;
  const newMainEditorEnd = `           </div>
        </div>
        )}
      </div>
      )}
    </div>,
    document.body
  );
}`;
  code = code.replace(mainEditorEnd, newMainEditorEnd);
  
  fs.writeFileSync('src/pages/admin/AdminCertificateBuilder.tsx', code);
}

patchCert();
