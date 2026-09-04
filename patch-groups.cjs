const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminGroups.tsx', 'utf-8');

code = code.replace(
  "setStudents(snap.docs.map(d => ({id: d.id, ...d.data()})));",
  "setStudents(snap.docs.map(d => ({id: d.id, ...d.data()})).filter((s: any) => s.status !== 'archived'));"
);

fs.writeFileSync('src/pages/admin/AdminGroups.tsx', code);
