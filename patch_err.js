import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf8');

code = code.replace(
  `const unsubTests = onSnapshot(collection(db, 'tests'), snap => {
      const titles = new Set<string>();
      snap.docs.forEach(d => {
        if (d.data().title) titles.add(d.data().title);
      });
      setExistingTests(Array.from(titles));
    });`,
  `const unsubTests = onSnapshot(collection(db, 'tests'), snap => {
      const titles = new Set<string>();
      snap.docs.forEach(d => {
        if (d.data().title) titles.add(d.data().title);
      });
      setExistingTests(Array.from(titles));
    }, err => {
      console.error('Error fetching tests:', err);
    });`
);
fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
