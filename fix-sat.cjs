const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');

const target = `                 {currentQ.isOpenEnded ? (
                       <div className="w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border transition-all border-gray-300 bg-gray-50">
                          <p className="text-gray-500 text-sm mb-3">O'z javobingizni kiriting:</p>
                          <div className="w-full bg-white p-4 rounded-lg border border-gray-300 text-gray-400 font-bold">
                             Javobingizni shu yerga yozing...
                          </div>
                       </div>
                    ) : (
                    currentQ.options.map((opt, optIndex) => (
                       <div key={optIndex} className={\`flex items-start gap-3 p-3 rounded-lg border \${currentQ.correctOptionIndex === optIndex ? 'border-green-500 bg-green-50' : 'border-gray-200'}\`}>
                          <span className="font-bold text-gray-500">{ALPHABET[optIndex]})</span>
                          <div className="flex-1 whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                             <Latex>{opt || '...'}</Latex>
                          </div>
                       </div>
                    ))
                    )}
                 </div>
              </div>
           </div>
        </div>
        )}
      </div>
    </div>,
    document.body
  );
}`;

const replacement = `                 {currentQ.isOpenEnded ? (
                   <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <MathAnswerField
                        value={currentQ.correctAnswerText || ''}
                        onChange={(latex) => updateQuestion(activeQuestion, 'correctAnswerText', latex)}
                        placeholder="To'g'ri javobni kiriting..."
                      />
                   </div>
                 ) : (
                 <div className="space-y-3">
                   {currentQ.options.map((opt, optIndex) => (
                    <div key={optIndex} className={\`flex items-start gap-3 p-4 rounded-xl border transition-all \${currentQ.correctOptionIndex === optIndex ? 'border-[#FEC204] bg-[#FEC204]/5' : 'border-white/10 bg-white/5'}\`}>
                       <button 
                         onClick={() => updateQuestion(activeQuestion, 'correctOptionIndex', optIndex)}
                         className={\`mt-1.5 w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 transition-colors \${currentQ.correctOptionIndex === optIndex ? 'border-[#FEC204] bg-[#FEC204] text-black' : 'border-white/20 text-transparent hover:border-white/40'}\`}
                       >
                         {currentQ.correctOptionIndex === optIndex && <CheckCircle2 size={14} />}
                       </button>
                       <div className="flex-1 relative">
                          <span className="absolute left-3 top-3 text-xs font-bold text-white/40">{ALPHABET[optIndex]}</span>
                          <textarea
                              value={opt}
                             onChange={(e) => updateOption(activeQuestion, optIndex, e.target.value)}
                             className="w-full glass-panel pl-8 p-3 outline-none focus:border-[#FEC204]/50 text-sm min-h-[50px] custom-scrollbar"
                             placeholder="Variant matni..."
                          />
                       </div>
                    </div>
                 ))}
                 </div>
                 )}
              </div>
           </div>

           {/* Preview panel */}
           <div className="flex-1 min-w-0 bg-[#121212] overflow-y-auto custom-scrollbar p-6">
              <h3 className="text-sm font-bold text-white/40 mb-4 uppercase tracking-wider">Ko'rinish (Preview)</h3>
              
              <div className="bg-white text-black p-6 rounded-xl shadow-lg min-h-[300px] w-full overflow-hidden">
                 <div className="mb-4 max-w-none whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    <Latex>{currentQ.text || 'Savol matni kiritilmagan...'}</Latex>
                 </div>
                 
                 {currentQ.imageUrl && (
                    <div className="mb-6">
                      <img src={currentQ.imageUrl} alt="Savol rasmi" className="max-w-full rounded" />
                    </div>
                 )}
                 
                 <div className="space-y-3 mt-6">
                    {currentQ.isOpenEnded ? (
                       <div className="w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border transition-all border-gray-300 bg-gray-50">
                          <p className="text-gray-500 text-sm mb-3">O'z javobingizni kiriting:</p>
                          <div className="w-full bg-white p-4 rounded-lg border border-gray-300 text-gray-400 font-bold">
                             Javobingizni shu yerga yozing...
                          </div>
                       </div>
                    ) : (
                    currentQ.options.map((opt, optIndex) => (
                       <div key={optIndex} className={\`flex items-start gap-3 p-3 rounded-lg border \${currentQ.correctOptionIndex === optIndex ? 'border-green-500 bg-green-50' : 'border-gray-200'}\`}>
                          <span className="font-bold text-gray-500">{ALPHABET[optIndex]})</span>
                          <div className="flex-1 whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                             <Latex>{opt || '...'}</Latex>
                          </div>
                       </div>
                    ))
                    )}
                 </div>
              </div>
           </div>
        </div>
        )}
      </div>
    </div>,
    document.body
  );
}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code);
  console.log('Fixed AdminSATBuilder.tsx');
} else {
  console.log('Target not found in AdminSATBuilder.tsx');
}
