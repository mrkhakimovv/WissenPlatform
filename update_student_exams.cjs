const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentExams.tsx', 'utf-8');

const targetStr = `<div className="flex items-center gap-2 text-sm text-white/70">
            <MapPin size={14} className="text-white/40" />
            <span>{exam.location}</span>
          </div>`;

code = code.replace(targetStr, '');
fs.writeFileSync('src/pages/student/StudentExams.tsx', code);
