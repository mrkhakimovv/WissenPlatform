const fs = require('fs');
const file = 'src/pages/admin/AdminAttendance.tsx';
let code = fs.readFileSync(file, 'utf-8');

const target = "const groupStudents = students.filter(s => s.groups?.includes(selectedGroupId) || s.groupId === selectedGroupId);";
const replacement = "const groupStudents = students.filter(s => s.groups?.includes(selectedGroupId) || s.groupId === selectedGroupId).sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));";

code = code.replace(target, replacement);

fs.writeFileSync(file, code);
