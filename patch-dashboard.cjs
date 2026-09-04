const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "setStats(s => ({ ...s, students: snap.docs.length, hasUnassignedStudents: unassigned }));",
  `const activeDocs = snap.docs.filter(d => d.data().status !== 'archived');
      setStats(s => ({ ...s, students: activeDocs.length, hasUnassignedStudents: unassigned }));`
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
