const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// I need to find `<div className="flex-1 flex flex-col md:flex-row overflow-hidden">` and replace everything until `{showExitConfirm`
// Actually, it's safer to just replace from `      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">`
// up to `      </div>\n      {showExitConfirm && (`.

const regex = /<div className="flex-1 flex flex-col md:flex-row overflow-hidden">[\s\S]*?<\/div>\s*\{showExitConfirm && \(/;

const newCode = `<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {isBubbleMode ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0a0a] custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Javoblar varaqasi</h3>
                <p className="text-white/50 text-sm">Savollarning javoblarini belgilang.</p>
              </div>
              <button
                onClick={() => {
                if (Object.keys(answers).length < testData.questions.length) {
                  setShowSubmitConfirm(true);
                } else {
                  handleSubmit();
                }
              }}
                className="px-6 py-3 rounded-xl bg-[#FEC204] text-black font-bold hover:bg-[#e6b003] transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)]"
              >
                Testni yakunlash
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {testData.questions.map((q, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10 relative">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white/70 text-lg">{idx + 1}-savol</span>
                    {q.isOpenEnded && (
                      <div className="p-1.5 rounded-md bg-white/10 text-white/40" title="Matnli javob">
                        <Type size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 w-full justify-center">
                    {q.isOpenEnded ? (
                      <MathAnswerField
                        value={answers[idx] || ''}
                        onChange={(latex) => setAnswers(prev => ({ ...prev, [idx]: latex }))}
                        placeholder="Javob"
                      />
                    ) : (
                      Array.from({length: testData.variantCount}).map((_, optIdx) => (
                        <button 
                          key={optIdx}
                          onClick={() => setAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                          className={\`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 \${answers[idx] === optIdx ? 'border-[#FEC204] bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)] scale-110' : 'border-white/20 text-white/40 hover:border-white/50 hover:text-white'}\`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
        {/* Left Sidebar - Progress */}
        <div className="w-full md:w-[260px] lg:w-[300px] shrink-0 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0d0d0d]/80 z-10">
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar md:h-full">
          <h3 className="text-white/60 font-bold mb-4 text-[13px] uppercase tracking-widest hidden md:block">Savollar</h3>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 custom-scrollbar">
            {testData.questions.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => document.getElementById(\`question-\${idx}\`)?.scrollIntoView({ behavior: 'smooth' })}
                className={\`relative shrink-0 w-10 h-10 md:w-full md:h-auto md:aspect-square rounded-lg flex items-center justify-center text-[13px] md:text-[14px] font-bold transition-all \${
                  false 
                    ? 'bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.3)] md:scale-105' 
                    : (answers[idx] !== undefined && answers[idx] !== "") 
                     ? 'bg-white/20 text-white border border-white/10'
                     : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent'
                }\`}
              >
                {idx + 1}
                {marked[idx] && (
                  <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-red-500 border-2 border-[#0d0d0d]" />
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-4 md:mt-8 border-t border-white/5 pt-4 md:pt-6">
            <button
              onClick={() => {
                if (Object.keys(answers).length < testData.questions.length) {
                  setShowSubmitConfirm(true);
                } else {
                  handleSubmit();
                }
              }}
              className="w-full py-3 md:py-4 rounded-[12px] md:rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold hover:bg-red-500/20 transition-colors text-[13px] md:text-[15px] flex justify-center items-center gap-2"
            >
              Testni yakunlash
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Questions */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-8 flex items-start justify-center relative">
        <div className="w-full max-w-3xl pt-2 md:pt-0 pb-10 space-y-8 md:space-y-12">
          {testData.questions.map((q, qIndex) => (
            <div 
              key={q.id || qIndex}
              id={\`question-\${qIndex}\`}
              className="glass-panel p-5 sm:p-6 md:p-10 rounded-[20px] md:rounded-[24px] relative"
            >
              <button
                onClick={() => setMarked(prev => ({ ...prev, [qIndex]: !prev[qIndex] }))}
                className={\`absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors \${
                  marked[qIndex] 
                    ? 'bg-[rgba(254,194,4,0.1)] text-[#FEC204]' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }\`}
              >
                <Bookmark size={18} className={\`md:w-[20px] md:h-[20px] \${marked[qIndex] ? "fill-current" : ""}\`} />
              </button>

              <h3 className="text-[15px] md:text-[20px] font-bold text-white mb-5 md:mb-6 leading-relaxed pr-10 md:pr-12 overflow-x-auto">
                <span className="text-[#FEC204] mr-2">{qIndex + 1}.</span>
                <Latex>{q.text}</Latex>
              </h3>
              
              {q.imageUrl && (
                <img src={q.imageUrl} alt="Savol rasmi" className="max-w-full h-auto max-h-[300px] object-contain rounded-[14px] md:rounded-xl mb-6 border border-white/10" />
              )}
              
              <div className="space-y-2 md:space-y-3">
                {q.isOpenEnded ? (
                  <div className="w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border transition-all bg-white/5 border-white/10">
                     <p className="text-white/70 text-sm mb-3">O'z javobingizni kiriting:</p>
                     <MathAnswerField
                       value={answers[qIndex] || ''}
                       onChange={(latex) => setAnswers(prev => ({ ...prev, [qIndex]: latex }))}
                       placeholder="Javobingizni shu yerga yozing..."
                       className="w-full glass-panel p-4 rounded-lg outline-none focus:border-[#FEC204] border border-white/10 text-white font-bold"
                     />
                  </div>
                ) : (
                  (() => {
                    const hasOptionText = q.options.some((opt) => opt && opt.trim() !== '');
                    return hasOptionText ? (
                      <div className="space-y-2 md:space-y-3">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              setAnswers(prev => ({ ...prev, [qIndex]: oIdx }));
                            }}
                            className={\`w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border transition-all \${
                              answers[qIndex] === oIdx
                                ? 'bg-[rgba(254,194,4,0.1)] border-[#FEC204] text-white'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }\`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={\`w-6 h-6 md:w-7 md:h-7 rounded border flex items-center justify-center shrink-0 mt-0 md:mt-0 text-[12px] md:text-[13px] font-bold \${
                                answers[qIndex] === oIdx ? 'border-[#FEC204] bg-[#FEC204] text-black' : 'border-white/20 text-white/50'
                              }\`}>
                                {String.fromCharCode(65 + oIdx)}
                              </div>
                              <span className="text-[13px] md:text-[15px] leading-snug overflow-x-auto"><Latex>{opt}</Latex></span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        {q.options.map((_, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              setAnswers(prev => ({ ...prev, [qIndex]: oIdx }));
                            }}
                            className={\`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full font-bold transition-all flex items-center justify-center text-lg \${
                              answers[qIndex] === oIdx
                                ? 'bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)]'
                                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                            }\`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </button>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
      </div>
      {showExitConfirm && (`;

code = code.replace(regex, newCode);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
