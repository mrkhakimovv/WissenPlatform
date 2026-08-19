const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const target = `<h2 className="text-white font-bold text-[14px] md:text-[16px] truncate">{exam.title}</h2>`;
const replace = `<h2 className="text-white font-bold text-[14px] md:text-[16px] truncate">{exam.title}</h2>
          <div className="flex gap-2 text-[10px] font-bold mt-0.5">
            <span className="text-[#FEC204] uppercase tracking-wider">
              {exam.testId 
                ? (exam.subject === 'Mavzulashtirilgan' ? 'Mavzulashtirilgan test' : exam.subject)
                : 'Imtihon'}
            </span>
          </div>`;
          
code = code.replace(target, replace);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
