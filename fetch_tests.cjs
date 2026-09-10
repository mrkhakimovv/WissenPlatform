const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

// Add testsData state
code = code.replace(/const \[results, setResults\] = useState<any\[\]>\(\[\]\);/, 
  "const [results, setResults] = useState<any[]>([]);\n  const [testsData, setTestsData] = useState<Record<string, any>>({});");

// Fetch tests
const effectMatch = code.indexOf(`let unsubResults: any;`);
code = code.slice(0, effectMatch) + 
`    const getTests = async () => {
      const snap = await getDocs(collection(db, 'tests'));
      const td: Record<string, any> = {};
      snap.docs.forEach(d => {
        td[d.id] = d.data();
      });
      setTestsData(td);
    };
    getTests();
    
    ` + code.slice(effectMatch);

fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
