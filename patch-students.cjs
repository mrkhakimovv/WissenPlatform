const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

code = code.replace(
  '<div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">',
  '<div className="flex items-center gap-1 opacity-100 transition-opacity">'
);

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
