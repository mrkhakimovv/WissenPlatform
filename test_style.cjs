const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// The bubble mode should look EXACTLY like the image provided in the new user request.
// Wait, the new image from the user IS NOT grid-cols-5. 
// It is a vertical list of blocks, centered.
// Let's modify the grid to be a vertical list.

const regex = /<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*\) : \(/;
const newCode = `<div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
              {testData.questions.map((q, idx) => (
                <div key={idx} className="bg-[#1a1a1a] rounded-[20px] p-6 sm:p-8 flex flex-col gap-6 border border-white/5 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FEC204] text-xl">{idx + 1}.</span>
                    <button
                      onClick={() => setMarked(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className={\`w-10 h-10 rounded-full flex items-center justify-center transition-colors \${
                        marked[idx] 
                          ? 'bg-[rgba(254,194,4,0.1)] text-[#FEC204]' 
                          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                      }\`}
                    >
                      <Bookmark size={20} className={marked[idx] ? "fill-current" : ""} />
                    </button>
                  </div>
                  <div className="flex gap-4 w-full">
                    {q.isOpenEnded ? (
                      <div className="w-full">
                         <p className="text-white/70 text-sm mb-3">O'z javobingizni kiriting:</p>
                         <MathAnswerField
                           value={answers[idx] || ''}
                           onChange={(latex) => setAnswers(prev => ({ ...prev, [idx]: latex }))}
                           placeholder="Javobingizni shu yerga yozing..."
                           className="w-full bg-[#2a2a2a] p-4 rounded-xl outline-none focus:border-[#FEC204] border border-white/10 text-white font-bold"
                         />
                      </div>
                    ) : (
                      Array.from({length: testData.variantCount}).map((_, optIdx) => (
                        <button 
                          key={optIdx}
                          onClick={() => setAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                          className={\`w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-200 \${answers[idx] === optIdx ? 'border-[#FEC204] bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)] scale-110' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white bg-[#2a2a2a]'}\`}
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
      ) : (`;

code = code.replace(regex, newCode);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
