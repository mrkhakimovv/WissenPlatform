const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const target = `{students.filter(s => searchTerm === '' || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())).map(student => {`;
const repl = `{activeStudents.filter(s => searchTerm === '' || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())).map(student => {`;

code = code.replace(target, repl);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
