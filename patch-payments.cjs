const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

// 1. Add search state
const targetState = `  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());`;
const replacementState = `  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');`;
code = code.replace(targetState, replacementState);

// 2. Add search input UI
const targetUI = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
               <h1 className="text-2xl font-black text-white tracking-tight">To'lovlar</h1>
               <p className="text-white/40 text-sm mt-1">O'quvchilar to'lovlarini nazorat qilish</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-2">`;
const replacementUI = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
               <h1 className="text-2xl font-black text-white tracking-tight">To'lovlar</h1>
               <p className="text-white/40 text-sm mt-1">O'quvchilar to'lovlarini nazorat qilish</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-2">
               <div className="relative">
                   <input
                       type="text"
                       placeholder="Ism bo'yicha qidirish..."
                       value={searchTerm || ""}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="bg-[#1a1a1a] text-white text-sm font-medium border border-white/10 px-4 py-2 rounded-xl outline-none focus:border-[#FEC204]/50 pl-10 w-full md:w-[250px]"
                   />
                   <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
               </div>`;
if (code.includes(targetUI)) {
    code = code.replace(targetUI, replacementUI);
} else {
    // try a more generic target
    const targetUI2 = `<div className="flex flex-wrap items-center gap-2">
               <select`;
    const replacementUI2 = `<div className="flex flex-wrap items-center gap-2">
               <div className="relative">
                   <input
                       type="text"
                       placeholder="Ism bo'yicha qidirish..."
                       value={searchTerm || ""}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="bg-[#1a1a1a] text-white text-sm font-medium border border-white/10 px-4 py-2 rounded-xl outline-none focus:border-[#FEC204]/50 pl-10 w-full md:w-[250px]"
                   />
                   <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
               </div>
               <select`;
    code = code.replace(targetUI2, replacementUI2);
}


// 3. Filter groupStudents by search term
const targetFilter = `const groupStudents = students.filter(s => s.groups?.includes(g.id) || s.groupId === g.id);`;
const replacementFilter = `const groupStudents = students
                  .filter(s => s.groups?.includes(g.id) || s.groupId === g.id)
                  .filter(s => searchTerm === '' || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));`;
code = code.replace(targetFilter, replacementFilter);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
console.log("Updated AdminPayments.tsx");
