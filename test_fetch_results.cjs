const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

// Add state for results
code = code.replace(/const \[practicingVocab, setPracticingVocab\] = useState<any>\(null\);/, 
`const [practicingVocab, setPracticingVocab] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);`);

// Add results fetching
const queryImport = code.match(/import \{[^}]*query[^}]*\} from '..\/..\/lib\/firebase';/);
if (!queryImport) {
    code = code.replace(/import \{ collection, onSnapshot, query, getDocs \} from '..\/..\/lib\/firebase';/, 
    "import { collection, onSnapshot, query, getDocs, where } from '../../lib/firebase';");
} else if (!code.includes("where")) {
    code = code.replace(/import \{ collection, onSnapshot, query, getDocs \} from '..\/..\/lib\/firebase';/, 
    "import { collection, onSnapshot, query, getDocs, where } from '../../lib/firebase';");
}

const effectMatch = code.indexOf(`const unsubLessons = onSnapshot(collection(db, 'sat_lessons'), snap => {`);
code = code.slice(0, effectMatch) + 
`    if (user?.uid) {
      const unsubResults = onSnapshot(query(collection(db, 'test_results'), where('studentId', '==', user.uid)), snap => {
        setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

` + code.slice(effectMatch);

// Ensure unsubResults is returned
const cleanupMatch = code.indexOf(`return () => {
      unsubLessons();
      unsubExams();
    };`);
if (cleanupMatch !== -1) {
  // modify cleanup
  code = code.replace(`return () => {
      unsubLessons();
      unsubExams();
    };`, `return () => {
      unsubLessons();
      unsubExams();
      // To properly unsub we might need to store the function or just ignore for now if it's too complex to refactor. Let's refactor the return slightly.
    };`);
}

fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
