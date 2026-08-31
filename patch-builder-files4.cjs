const fs = require('fs');

function patchTest() {
  let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf-8');
  
  if (!code.includes('import MathAnswerField')) {
     code = code.replace("import Latex from 'react-latex-next';", "import Latex from 'react-latex-next';\nimport MathAnswerField from '../../components/MathAnswerField';\nimport { Type } from 'lucide-react';");
  }
  
  const oldGrid = `<span className="font-bold text-white/70 text-lg">{i + 1}-savol</span>
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
                    </div>`;

  const newGrid = `<div className="flex items-center gap-2">
                      <span className="font-bold text-white/70 text-lg">{i + 1}-savol</span>
                      <button 
                        onClick={() => updateQuestion(i, 'isOpenEnded', !q.isOpenEnded)}
                        className={\`p-1.5 rounded-md transition-colors \${q.isOpenEnded ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}\`}
                        title={q.isOpenEnded ? "Test turiga o'tkazish" : "Yopiq savol (matnli) ga o'tkazish"}
                      >
                        <Type size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2 w-full justify-center">
                      {q.isOpenEnded ? (
                        <MathAnswerField
                          value={q.correctAnswerText || ''}
                          onChange={(latex) => updateQuestion(i, 'correctAnswerText', latex)}
                          placeholder="Javob"
                        />
                      ) : (
                        Array.from({length: testData.variantCount}).map((_, optIdx) => (
                          <button 
                            key={optIdx}
                            onClick={() => updateQuestion(i, 'correctOptionIndex', optIdx)}
                            className={\`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 \${q.correctOptionIndex === optIdx ? 'border-[#FEC204] bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)] scale-110' : 'border-white/20 text-white/40 hover:border-white/50 hover:text-white'}\`}
                          >
                            {ALPHABET[optIdx]}
                          </button>
                        ))
                      )}
                    </div>`;
                    
  code = code.replace(oldGrid, newGrid);
  
  fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code);
}

patchTest();
