const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

code = code.replace(
  "setStudents(snap.docs.map(d => ({id: d.id, ...(d.data() as any)})).filter(s => s.role === 'student'));",
  "setStudents(snap.docs.map(d => ({id: d.id, ...(d.data() as any)})).filter(s => s.role === 'student' && s.status !== 'archived'));"
);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
