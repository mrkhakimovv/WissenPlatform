import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

// Add state
code = code.replace(
  /const \[subjects, setSubjects\] = useState<any\[\]>\(\[\]\);/,
  "const [subjects, setSubjects] = useState<any[]>([]);\n  const [existingTests, setExistingTests] = useState<string[]>([]);"
);

// Add useEffect logic
code = code.replace(
  /const unsubSubjects = onSnapshot\(collection\(db, 'subjects'\), snap => \{[\s\S]*?\}\);/,
  `const unsubSubjects = onSnapshot(collection(db, 'subjects'), snap => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubTests = onSnapshot(collection(db, 'tests'), snap => {
      const titles = new Set<string>();
      snap.docs.forEach(d => {
        if (d.data().title) titles.add(d.data().title);
      });
      setExistingTests(Array.from(titles));
    });`
);

// Update cleanup
code = code.replace(
  /return \(\) => \{ unsubExams\(\); unsubGroups\(\); unsubSubjects\(\); \};/,
  "return () => { unsubExams(); unsubGroups(); unsubSubjects(); unsubTests(); };"
);

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
