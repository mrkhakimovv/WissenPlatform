import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

code = code.replace(
  /<input required value=\{testConfig.title\} onChange=\{e=>setTestConfig\(\{\.\.\.testConfig, title: e.target.value\}\)\} placeholder="Masalan: Matematika oylik test" className="w-full glass-panel p-3 outline-none focus:border-\[#FEC204\]\/50 text-sm text-white" \/>/,
  `<input required list="existing-test-names" value={testConfig.title} onChange={e=>setTestConfig({...testConfig, title: e.target.value})} placeholder="Masalan: Matematika oylik test" className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                <datalist id="existing-test-names">
                  {existingTests.map((t, idx) => (
                    <option key={idx} value={t} />
                  ))}
                </datalist>`
);

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
