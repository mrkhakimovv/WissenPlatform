import fs from 'fs';

let dbCode = fs.readFileSync('src/pages/admin/AdminTestsDatabase.tsx', 'utf8');

// Replace testConfig state
dbCode = dbCode.replace(
    /const \[testConfig, setTestConfig\] = useState<TestData \| null>\(null\);/,
    `const [testConfig, setTestConfig] = useState<TestData>({
    title: '',
    questionCount: 10,
    variantCount: 4,
    testType: 'Mavzulashtirilgan',
    questions: [],
    createdAt: ''
  });
  const [isTestConfigOpen, setIsTestConfigOpen] = useState(false);
  const [existingTests, setExistingTests] = useState<string[]>([]);`
);

// Replace button onClick
dbCode = dbCode.replace(
    /onClick=\{\(\) => \{\s*setTestConfig\(null\);\s*setIsTestBuilderOpen\(true\);\s*\}\}/,
    `onClick={() => {
            setTestConfig({
              title: '',
              questionCount: 10,
              variantCount: 4,
              testType: 'Mavzulashtirilgan',
              questions: [],
              createdAt: ''
            });
            setIsTestConfigOpen(true);
          }}`
);

// Replace testConfig && (
dbCode = dbCode.replace(
    /isTestBuilderOpen && testConfig && \(/,
    `isTestBuilderOpen && (`
);

// Find the place to insert the modal (before isTestBuilderOpen modal)
const modalJSX = `
      {isTestConfigOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[450px] bg-[#0d0d0d] border border-white/10 rounded-[20px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-black tracking-tight text-white">Test parametrlarini kiritish</h2>
              <button onClick={() => setIsTestConfigOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test nomi</label>
                <input required list="existing-test-names" value={testConfig.title} onChange={e=>setTestConfig({...testConfig, title: e.target.value})} placeholder="Masalan: Matematika oylik test" className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                <datalist id="existing-test-names">
                  {existingTests.map((t, idx) => (
                    <option key={idx} value={t} />
                  ))}
                </datalist>
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
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test shakli</label>
                <select value={testConfig.testType} onChange={e=>setTestConfig({...testConfig, testType: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="Mavzulashtirilgan" className="bg-[#1a1a1a]">Mavzulashtirilgan</option>
                  <option value="Nazorat testi" className="bg-[#1a1a1a]">Nazorat testi</option>
                  <option value="Olimpiada" className="bg-[#1a1a1a]">Olimpiada</option>
                  <option value="Blok test" className="bg-[#1a1a1a]">Blok test</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsTestConfigOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (!testConfig.title) {
                      toast.error("Test nomini kiriting");
                      return;
                    }
                    setIsTestConfigOpen(false);
                    setIsTestBuilderOpen(true);
                  }} 
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]"
                >
                  Davom etish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTestBuilderOpen && (`;

dbCode = dbCode.replace('{isTestBuilderOpen && (', modalJSX);

// Add existingTests population in useEffect
const useEffectRegex = /const testsArr: TestData\[\] = \[\];\s*snap\.docs\.forEach\(d => \{\s*testsArr\.push\(\{ id: d\.id, \.\.\.d\.data\(\) \} as TestData\);\s*\}\);/;
dbCode = dbCode.replace(useEffectRegex, `const testsArr: TestData[] = [];
      const titles = new Set<string>();
      snap.docs.forEach(d => {
        testsArr.push({ id: d.id, ...d.data() } as TestData);
        if (d.data().title) titles.add(d.data().title);
      });
      setExistingTests(Array.from(titles));`);

fs.writeFileSync('src/pages/admin/AdminTestsDatabase.tsx', dbCode);
console.log("Updated AdminTestsDatabase");
