import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf8');

if (!code.includes("AdminTestsDatabase")) {
  code = code.replace(
    "import AdminTestBuilder from './AdminTestBuilder';",
    "import AdminTestBuilder from './AdminTestBuilder';\nimport AdminTestsDatabase from './AdminTestsDatabase';"
  );
}

if (!code.includes("const [allTests, setAllTests]")) {
  code = code.replace(
    "const [existingTests, setExistingTests] = useState<string[]>([]);",
    "const [existingTests, setExistingTests] = useState<string[]>([]);\n  const [allTests, setAllTests] = useState<TestData[]>([]);\n  const [isTestsDatabaseOpen, setIsTestsDatabaseOpen] = useState(false);"
  );
}

code = code.replace(
  `    const unsubTests = onSnapshot(collection(db, 'tests'), snap => {
      const titles = new Set<string>();
      snap.docs.forEach(d => {
        if (d.data().title) titles.add(d.data().title);
      });
      setExistingTests(Array.from(titles));
    }, err => {
      console.error('Error fetching tests:', err);
    });`,
  `    const unsubTests = onSnapshot(collection(db, 'tests'), snap => {
      const titles = new Set<string>();
      const testsArr: TestData[] = [];
      snap.docs.forEach(d => {
        const data = { id: d.id, ...d.data() } as TestData;
        testsArr.push(data);
        if (data.title) titles.add(data.title);
      });
      setAllTests(testsArr);
      setExistingTests(Array.from(titles));
    }, err => {
      console.error('Error fetching tests:', err);
    });`
);

code = code.replace(
  `        <div className="flex gap-2">
          <button onClick={() => setIsTestConfigOpen(true)} className="glass-panel px-6 py-3 font-bold text-white hover:bg-white/10 transition-colors rounded-[12px] border border-white/20">
            Test yaratish
          </button>
          <button onClick={openAdd} className="glass-panel px-6 py-3 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black transition-colors rounded-[12px]">
            Imtihon qo'shish
          </button>
        </div>`,
  `        <div className="flex gap-2">
          <button onClick={() => setIsTestsDatabaseOpen(true)} className="glass-panel px-6 py-3 font-bold text-white hover:bg-white/10 transition-colors rounded-[12px] border border-white/20">
            Testlar bazasi
          </button>
          <button onClick={() => setIsTestConfigOpen(true)} className="glass-panel px-6 py-3 font-bold text-white hover:bg-white/10 transition-colors rounded-[12px] border border-white/20">
            Test yaratish
          </button>
          <button onClick={openAdd} className="glass-panel px-6 py-3 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black transition-colors rounded-[12px]">
            Imtihon qo'shish
          </button>
        </div>`
);

if (!code.includes("<AdminTestsDatabase")) {
  code = code.replace(
    "{isTestBuilderOpen && (",
    `{isTestsDatabaseOpen && (
        <AdminTestsDatabase 
          tests={allTests} 
          onClose={() => setIsTestsDatabaseOpen(false)} 
          onEdit={(t) => {
             setTestConfig(t);
             setIsTestsDatabaseOpen(false);
             setIsTestBuilderOpen(true);
          }} 
        />
      )}
      
      {isTestBuilderOpen && (`
  );
}

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
