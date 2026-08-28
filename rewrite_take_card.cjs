const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf8');

const targetLoop = `<div className="max-w-4xl w-full mx-auto space-y-12">
            {testData.questions.map((q: any, qIndex: number) => (
              <div key={q.id} id={\`question-\${qIndex}\`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Savol {qIndex + 1}</h3>
                  {q.isOpenEnded && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded font-bold text-sm">Ochiq savol (2 qism)</span>}
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <div className="text-lg text-white mb-6 whitespace-pre-wrap">
                    <Latex>{q.text || ''}</Latex>
                  </div>
                  {q.imageUrl && (
                    <img src={q.imageUrl} alt="Savol" className="max-h-64 rounded-xl border border-white/10 mb-6" />
                  )}

                  {q.isOpenEnded ? (
                    <div className="space-y-6">
                      {/* Part a */}
                      <div>
                        <label className="text-white/70 font-bold mb-2 block">a) javobingizni kiriting:</label>
                        <MathAnswerField
                          value={userAnswers[\`\${q.id}_0\`] || ''}
                          onChange={(latex) => handleOpenAnswer(q.id, 0, latex)}
                          placeholder="a) javob (matematik ham mumkin)"
                        />
                      </div>
                      {/* Part b */}
                      <div>
                        <label className="text-white/70 font-bold mb-2 block">b) javobingizni kiriting:</label>
                        <MathAnswerField
                          value={userAnswers[\`\${q.id}_1\`] || ''}
                          onChange={(latex) => handleOpenAnswer(q.id, 1, latex)}
                          placeholder="b) javob (matematik ham mumkin)"
                        />
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const hasOptionText = q.options.some((opt: string) => opt && opt.trim() !== '');
                      return hasOptionText ? (
                        <div className="space-y-3">
                          {q.options.map((opt: string, optIndex: number) => {
                            const isSelected = userAnswers[q.id] === optIndex;
                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleSelectOption(q.id, optIndex)}
                                className={\`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 \${isSelected ? 'border-[#FEC204] bg-[#FEC204]/10' : 'border-white/10 hover:border-white/30 bg-[#1a1a1a]'}\`}
                              >
                                <div className={\`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 \${isSelected ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/50'}\`}>
                                  {ALPHABET[optIndex]}
                                </div>
                                <div className={\`flex-1 \${isSelected ? 'text-white' : 'text-white/70'}\`}>
                                  <Latex>{opt}</Latex>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-4">
                          {q.options.map((_: any, optIndex: number) => {
                            const isSelected = userAnswers[q.id] === optIndex;
                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleSelectOption(q.id, optIndex)}
                                className={\`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full font-bold transition-all flex items-center justify-center text-lg \${
                                  isSelected
                                    ? 'bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)]'
                                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                }\`}
                              >
                                {ALPHABET[optIndex]}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            ))}
          </div>`;

const newLoop = `<div className="max-w-4xl w-full mx-auto space-y-4">
            {testData.questions.map((q: any, qIndex: number) => (
              <div key={q.id} id={\`question-\${qIndex}\`} className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10 bg-[#1a1a1a]/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#FEC204]">{qIndex + 1}-savol:</h3>
                  {q.isOpenEnded && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg font-bold text-xs uppercase tracking-wider">Ochiq savol (2 qism)</span>}
                </div>

                {q.text && (
                  <div className="text-base text-white mb-6 whitespace-pre-wrap">
                    <Latex>{q.text}</Latex>
                  </div>
                )}
                
                {q.imageUrl && (
                  <img src={q.imageUrl} alt="Savol" className="max-h-64 rounded-xl border border-white/10 mb-6" />
                )}

                {q.isOpenEnded ? (
                  <div className="space-y-6">
                    {/* Part a */}
                    <div>
                      <label className="text-white/70 font-bold mb-2 block text-sm">a) javobingizni kiriting:</label>
                      <MathAnswerField
                        value={userAnswers[\`\${q.id}_0\`] || ''}
                        onChange={(latex) => handleOpenAnswer(q.id, 0, latex)}
                        placeholder="a) javob (matematik ham mumkin)"
                      />
                    </div>
                    {/* Part b */}
                    <div>
                      <label className="text-white/70 font-bold mb-2 block text-sm">b) javobingizni kiriting:</label>
                      <MathAnswerField
                        value={userAnswers[\`\${q.id}_1\`] || ''}
                        onChange={(latex) => handleOpenAnswer(q.id, 1, latex)}
                        placeholder="b) javob (matematik ham mumkin)"
                      />
                    </div>
                  </div>
                ) : (
                  (() => {
                    const hasOptionText = q.options.some((opt: string) => opt && opt.trim() !== '');
                    return hasOptionText ? (
                      <div className="space-y-3">
                        {q.options.map((opt: string, optIndex: number) => {
                          const isSelected = userAnswers[q.id] === optIndex;
                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleSelectOption(q.id, optIndex)}
                              className={\`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 \${isSelected ? 'border-[#FEC204] bg-[#FEC204]/10' : 'border-white/10 hover:border-white/30 bg-white/5'}\`}
                            >
                              <div className={\`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 \${isSelected ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/50'}\`}>
                                {ALPHABET[optIndex]}
                              </div>
                              <div className={\`flex-1 \${isSelected ? 'text-white' : 'text-white/70'}\`}>
                                <Latex>{opt}</Latex>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                        {q.options.map((_: any, optIndex: number) => {
                          const isSelected = userAnswers[q.id] === optIndex;
                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleSelectOption(q.id, optIndex)}
                              className={\`py-3 md:py-4 rounded-xl font-black transition-all flex items-center justify-center text-base md:text-lg border-2 \${
                                isSelected
                                  ? 'bg-[#FEC204] border-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)]'
                                  : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                              }\`}
                            >
                              {ALPHABET[optIndex]}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>
            ))}
          </div>`;

if (code.includes(targetLoop.substring(0, 50))) { // Just checking if it exists mostly
    code = code.replace(targetLoop, newLoop);
    fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
    console.log("Patched responsive question cards");
} else {
    console.log("Could not find question card block. Looking for partial...");
}
