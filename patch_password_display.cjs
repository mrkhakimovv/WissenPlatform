const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

code = code.replace(
  /<span className="text-\[13px\] text-white\/50">Parol:<\/span>\s*<span className="text-\[13px\] text-white\/90 font-medium">\*\*\*<\/span>/,
  `<span className="text-[13px] text-white/50">Parol:</span>
                  <span className="text-[13px] text-white/90 font-medium">{student.password || '***'}</span>`
);

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
