const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentDashboard.tsx', 'utf-8');

const target = `{new Date().toLocaleString('uz-UZ', {month: 'long'})} oyi uchun`;
const repl = `{['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'][new Date().getMonth()]} oyi uchun`;

code = code.replace(target, repl);
fs.writeFileSync('src/pages/student/StudentDashboard.tsx', code);
