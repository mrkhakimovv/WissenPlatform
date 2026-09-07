const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentAttendance.tsx', 'utf-8');

const target = `const monthName = currentDate.toLocaleString('uz-UZ', { month: 'long' });`;
const repl = `const monthName = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'][currentDate.getMonth()];`;

code = code.replace(target, repl);
fs.writeFileSync('src/pages/student/StudentAttendance.tsx', code);
