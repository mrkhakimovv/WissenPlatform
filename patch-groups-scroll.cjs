const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminGroups.tsx', 'utf-8');

const targetModal = \`className="w-full md:w-[400px] bg-[#0d0d0d] border border-white/10 rounded-t-[20px] md:rounded-[20px] p-5 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95"\`;
const newModal = \`className="w-full md:w-[400px] bg-[#0d0d0d] border border-white/10 rounded-t-[20px] md:rounded-[20px] p-5 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[85vh] overflow-y-auto"\`;

code = code.replace(targetModal, newModal);

fs.writeFileSync('src/pages/admin/AdminGroups.tsx', code);
