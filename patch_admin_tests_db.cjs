const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminTestsDatabase.tsx', 'utf-8');

const targetStr = `              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test shakli</label>
                  <select value={testConfig.testType} onChange={e=>setTestConfig({...testConfig, testType: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                    <option value="Mavzulashtirilgan" className="bg-[#1a1a1a]">Mavzulashtirilgan</option>
                    <option value="Nazorat testi" className="bg-[#1a1a1a]">Nazorat testi</option>
                    <option value="Olimpiada" className="bg-[#1a1a1a]">Olimpiada</option>
                    <option value="Blok test" className="bg-[#1a1a1a]">Blok test</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Urinishlar soni</label>
                  <input required type="number" min="1" max="100" value={testConfig.maxAttempts || 1} onChange={e=>setTestConfig({...testConfig, maxAttempts: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                </div>
              </div>`;

const replaceStr = `              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test shakli</label>
                <select value={testConfig.testType} onChange={e=>setTestConfig({...testConfig, testType: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="Mavzulashtirilgan" className="bg-[#1a1a1a]">Mavzulashtirilgan</option>
                  <option value="Nazorat testi" className="bg-[#1a1a1a]">Nazorat testi</option>
                  <option value="Olimpiada" className="bg-[#1a1a1a]">Olimpiada</option>
                  <option value="Blok test" className="bg-[#1a1a1a]">Blok test</option>
                </select>
              </div>`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/pages/admin/AdminTestsDatabase.tsx', code);
