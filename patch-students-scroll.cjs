const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

const targetModal = 'className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/80"';
const newModal = 'className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/80 max-h-[85vh] overflow-y-auto"';

if(code.includes(targetModal)) {
    code = code.replace(targetModal, newModal);
    fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
    console.log("Updated AdminStudents.tsx");
}
