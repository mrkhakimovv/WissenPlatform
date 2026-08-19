const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

const targetStr2 = `<div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin size={14} className="text-white/40" />
                  <span>{exam.location}</span>
                </div>`;

code = code.replace(targetStr2, '');
fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
