const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  `{stats.archivedStudents > 0 && <span className="text-white/40">• {stats.archivedStudents} arxivda</span>}`,
  `{stats.archivedStudents > 0 && <span className="text-white/40">&bull; {stats.archivedStudents} arxivda</span>}`
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
