const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf-8');

const oldVariantSection = `<label className="text-sm font-bold text-white/70">Variantlar</label>
                 {currentQ.options.map((opt, optIndex) => (`;

const newVariantSection = `<div className="flex items-center justify-between">
                   <label className="text-sm font-bold text-white/70">
                     {currentQ.isOpenEnded ? "To'g'ri javob (Ochiq savol)" : "Variantlar"}
                   </label>
                   <button 
                     onClick={() => updateQuestion(activeQuestion, 'isOpenEnded', !currentQ.isOpenEnded)}
                     className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${currentQ.isOpenEnded ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white hover:bg-white/20'}\`}
                   >
                     <Type size={14} /> {currentQ.isOpenEnded ? "Test (Yopiq) qilish" : "Ochiq savol qilish"}
                   </button>
                 </div>
                 {currentQ.isOpenEnded ? (
                   <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <MathAnswerField
                        value={currentQ.correctAnswerText || ''}
                        onChange={(latex) => updateQuestion(activeQuestion, 'correctAnswerText', latex)}
                        placeholder="To'g'ri javobni kiriting..."
                      />
                   </div>
                 ) : (
                 currentQ.options.map((opt, optIndex) => (`;

code = code.replace(oldVariantSection, newVariantSection);

const oldPreviewSection = `{currentQ.options.map((opt, optIndex) => (
                       <div key={optIndex} className={\`flex items-start gap-3 p-3 rounded-lg border \${currentQ.correctOptionIndex === optIndex ? 'border-green-500 bg-green-50' : 'border-gray-200'}\`}>
                          <span className="font-bold text-gray-500">{ALPHABET[optIndex]})</span>
                          <div className="flex-1 whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                             <Latex>{opt || '...'}</Latex>
                          </div>
                       </div>
                    ))}`;

const newPreviewSection = `{currentQ.isOpenEnded ? (
                       <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                          <span className="font-bold text-gray-500 mb-2 block">To'g'ri javob:</span>
                          <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
                             <Latex>{currentQ.correctAnswerText ? \`$$\${currentQ.correctAnswerText}$$\` : 'Kiritilmagan'}</Latex>
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
                    )}`;

code = code.replace(oldPreviewSection, newPreviewSection);

fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code);
