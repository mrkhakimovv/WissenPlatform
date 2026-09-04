const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

code = code.replace(
    "onChange={e=>setTestConfig({...testConfig, satType: e.target.value})}",
    `onChange={e => {
                    const type = e.target.value;
                    if (type === 'SAT real EXAM') {
                      setTestConfig({ ...testConfig, satType: type, questionCount: 44, isFastMode: false });
                    } else {
                      setTestConfig({ ...testConfig, satType: type });
                    }
                  }}`
);

// If SAT real EXAM is selected, we might want to disable "Test formati" and "Savollar soni"
code = code.replace(
    `onClick={() => setTestConfig({...testConfig, isFastMode: false})}`,
    `onClick={() => testConfig.satType !== 'SAT real EXAM' && setTestConfig({...testConfig, isFastMode: false})}`
);
code = code.replace(
    `onClick={() => setTestConfig({...testConfig, isFastMode: true})}`,
    `onClick={() => testConfig.satType !== 'SAT real EXAM' && setTestConfig({...testConfig, isFastMode: true})}`
);
code = code.replace(
    `value={testConfig.questionCount} onChange={e=>setTestConfig({...testConfig, questionCount: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />`,
    `value={testConfig.questionCount} onChange={e=>setTestConfig({...testConfig, questionCount: Number(e.target.value)})} disabled={testConfig.satType === 'SAT real EXAM'} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white disabled:opacity-50" />`
);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
console.log('Done');
