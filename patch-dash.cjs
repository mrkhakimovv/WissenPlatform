const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  'students: 0,',
  'students: 0,\n    archivedStudents: 0,'
);

code = code.replace(
  `const activeDocs = snap.docs.filter(d => d.data().status !== 'archived');
      setStats(s => ({ ...s, students: activeDocs.length, hasUnassignedStudents: unassigned }));`,
  `const activeDocs = snap.docs.filter(d => d.data().status !== 'archived');
      const archivedCount = snap.docs.length - activeDocs.length;
      setStats(s => ({ ...s, students: activeDocs.length, archivedStudents: archivedCount, hasUnassignedStudents: unassigned }));`
);

code = code.replace(
  '<p className="text-xs font-bold text-white/40 mt-1.5">+ Barcha</p>',
  `<p className="text-xs font-bold mt-1.5 flex items-center gap-2">
            <span className="text-[#4ade80]">+ Barcha</span>
            {stats.archivedStudents > 0 && <span className="text-white/40">• {stats.archivedStudents} arxivda</span>}
          </p>`
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
