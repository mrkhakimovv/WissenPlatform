const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const target = `<button 
                        onClick={() => handleDelete(p.id)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                        title="To'lovni bekor qilish"
                     >
                        <Trash2 size={14} />
                     </button>`;
const repl = `<button 
                        onClick={() => handleDelete(p.id)} 
                        className="relative z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors pointer-events-auto"
                        title="To'lovni bekor qilish"
                     >
                        <Trash2 size={14} />
                     </button>`;

code = code.replace(target, repl);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
