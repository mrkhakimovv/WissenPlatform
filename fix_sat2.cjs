const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

code = code.replace(
  /(\s*\)\s*:\s*\(\s*<>\s*<div className="mb-4">\s*<p[^>]*>Barcha yaratilgan testlar to'plami<\/p>)/,
  `\n        ) : activeTab === 'base' ? ( \n           <>\n              <div className="mb-4">\n                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami</p>`
);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
