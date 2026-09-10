const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const oldBubble = `              {testData.questions.map((q, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10">
                  <span className="font-bold text-white/70">{idx + 1}-savol</span>
                  <div className="flex flex-col gap-2 w-full">
                    {q.isOpenEnded ? (
                      <MathAnswerField
                        value={answers[idx] || ''}
                        onChange={(latex) => setAnswers(prev => ({ ...prev, [idx]: latex }))}
                        placeholder="Javobingiz"
                      />
                    ) : (
                      Array.from({length: testData.variantCount}).map((_, optIdx) => (
                        <button 
                          key={optIdx}
                          onClick={() => setAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                          className={\`w-full py-2 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 \${answers[idx] === optIdx ? 'border-[#FEC204] bg-[#FEC204] text-black' : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'}\`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}`;

const newBubble = `              {testData.questions.map((q, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10 relative">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white/70 text-lg">{idx + 1}-savol</span>
                    {q.isOpenEnded && (
                      <div className="p-1.5 rounded-md bg-white/10 text-white/40">
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
              ))}`;

code = code.replace(oldBubble, newBubble);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
