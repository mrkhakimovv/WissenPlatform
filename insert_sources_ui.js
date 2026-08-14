import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf8');

const sourceCode = `
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                <label className="text-[12px] font-bold text-[#FEC204] mb-3 block">Test manbalarini sozlash</label>
                
                {formData.testSources.map((ts, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <select 
                      value={ts.testId} 
                      onChange={(e) => {
                        const newSources = [...formData.testSources];
                        newSources[idx].testId = e.target.value;
                        newSources[idx].name = allTests.find(t => t.id === e.target.value)?.title || '';
                        setFormData({...formData, testSources: newSources});
                      }}
                      className="flex-1 glass-panel p-2 outline-none focus:border-[#FEC204]/50 text-xs text-white appearance-none" style={{ colorScheme: "dark" }}
                    >
                      <option value="" disabled>Testni tanlang</option>
                      {allTests.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#1a1a1a]">{t.title} ({t.totalCount} ta savol)</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="Savol soni" 
                      value={ts.count} 
                      onChange={(e) => {
                        const newSources = [...formData.testSources];
                        newSources[idx].count = parseInt(e.target.value) || 0;
                        setFormData({...formData, testSources: newSources});
                      }}
                      className="w-20 glass-panel p-2 outline-none focus:border-[#FEC204]/50 text-xs text-center"
                    />
                    <button type="button" onClick={() => {
                        const newSources = [...formData.testSources];
                        newSources.splice(idx, 1);
                        setFormData({...formData, testSources: newSources});
                    }} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <button type="button" onClick={() => {
                  setFormData({
                    ...formData,
                    testSources: [...formData.testSources, {testId: '', name: '', count: 10}]
                  });
                }} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/70 transition-colors mt-2 flex justify-center items-center gap-1">
                  <span className="text-lg leading-none">+</span> Manba qo'shish
                </button>
              </div>

`;

code = code.replace(
  /<textarea placeholder="Qo'shimcha/g,
  sourceCode + "              <textarea placeholder=\"Qo'shimcha"
);

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
