const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentPayments.tsx', 'utf-8');

const target = `                  <p className="text-white text-[14px] font-bold">
                    {new Date(2026, item.month - 1).toLocaleString('uz-UZ', { month: 'long' })} oyi uchun
                  </p>`;

const repl = `                  <p className="text-white text-[14px] font-bold">
                    {item.year}-yil, {['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'][item.month - 1]}
                  </p>`;

code = code.replace(target, repl);
fs.writeFileSync('src/pages/student/StudentPayments.tsx', code);
