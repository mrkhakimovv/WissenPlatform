const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const oldVocabRow = `                {vocabForm.pairs.map((pair, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Apple"
                      value={pair.eng}
                      onChange={(e) => handleUpdateVocabPair(idx, 'eng', e.target.value)}
                      className="w-full glass-panel px-3 py-2 outline-none focus:border-[#FEC204]/50 text-sm text-white"
                    />
                    <input
                      placeholder="Olma"
                      value={pair.uz}
                      onChange={(e) => handleUpdateVocabPair(idx, 'uz', e.target.value)}
                      className="w-full glass-panel px-3 py-2 outline-none focus:border-[#FEC204]/50 text-sm text-white"
                    />
                  </div>
                ))}`;

const newVocabRow = `                {vocabForm.pairs.map((pair, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-5 text-right text-xs font-bold text-white/40">
                      {idx + 1}.
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input
                        placeholder="Apple"
                        value={pair.eng}
                        onChange={(e) => handleUpdateVocabPair(idx, 'eng', e.target.value)}
                        className="w-full glass-panel px-3 py-2 outline-none focus:border-[#FEC204]/50 text-sm text-white"
                      />
                      <input
                        placeholder="Olma"
                        value={pair.uz}
                        onChange={(e) => handleUpdateVocabPair(idx, 'uz', e.target.value)}
                        className="w-full glass-panel px-3 py-2 outline-none focus:border-[#FEC204]/50 text-sm text-white"
                      />
                    </div>
                  </div>
                ))}`;

code = code.replace(oldVocabRow, newVocabRow);
fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
