const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const targetToReplace = `              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Savollar soni</label>
                  <input required type="number" min="1" max="100" value={testConfig.questionCount} onChange={e=>setTestConfig({...testConfig, questionCount: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Variantlar soni</label>
                  <select value={testConfig.variantCount} onChange={e=>setTestConfig({...testConfig, variantCount: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                    <option value={3} className="bg-[#1a1a1a]">3 ta (A, B, C)</option>
                    <option value={4} className="bg-[#1a1a1a]">4 ta (A, B, C, D)</option>
                    <option value={5} className="bg-[#1a1a1a]">5 ta (A, B, C, D, E)</option>
                  </select>
                </div>
              </div>`;

const newCode = `              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test formati</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setTestConfig({...testConfig, isFastMode: false})} className={\`py-3 px-4 rounded-xl font-bold text-sm transition-colors border-2 \${!testConfig.isFastMode ? 'bg-[#FEC204]/10 border-[#FEC204] text-[#FEC204]' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}\`}>Savol + Javob</button>
                  <button type="button" onClick={() => setTestConfig({...testConfig, isFastMode: true})} className={\`py-3 px-4 rounded-xl font-bold text-sm transition-colors border-2 \${testConfig.isFastMode ? 'bg-[#FEC204]/10 border-[#FEC204] text-[#FEC204]' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}\`}>Faqat Javoblar</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Savollar soni</label>
                  <input required type="number" min="1" max="100" value={testConfig.questionCount} onChange={e=>setTestConfig({...testConfig, questionCount: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Variantlar soni</label>
                  <select value={testConfig.variantCount} onChange={e=>setTestConfig({...testConfig, variantCount: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                    <option value={3} className="bg-[#1a1a1a]">3 ta (A, B, C)</option>
                    <option value={4} className="bg-[#1a1a1a]">4 ta (A, B, C, D)</option>
                    <option value={5} className="bg-[#1a1a1a]">5 ta (A, B, C, D, E)</option>
                  </select>
                </div>
              </div>`;

code = code.replace(targetToReplace, newCode);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
