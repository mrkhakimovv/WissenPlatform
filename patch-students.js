const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

code = code.replace(
  "import { Plus, Search, Trash2, Edit2, X, ChevronRight, CheckCircle2, Layers } from 'lucide-react';",
  "import { Plus, Search, Trash2, Edit2, X, ChevronRight, CheckCircle2, Layers, Archive } from 'lucide-react';"
);

// add activeTab state
code = code.replace(
  "const [search, setSearch] = useState('');",
  "const [search, setSearch] = useState('');\n  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');"
);

// add handleArchive function
const handleDeleteCode = "const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {";
code = code.replace(
  handleDeleteCode,
  `const handleArchive = async (e: React.MouseEvent, id: string, name: string, isArchived: boolean) => {
    e.stopPropagation();
    if(await confirm({ title: 'Diqqat', message: \`\${name} ni \${isArchived ? "faollashtirmoqchimisiz" : "arxivlamoqchimisiz"}?\` })) {
      try {
        await updateDoc(doc(db, 'users', id), { status: isArchived ? 'active' : 'archived' });
        toast.success(isArchived ? "Faollashtirildi" : "Arxivlandi");
      } catch (err: any) {
        toast.error("Xatolik yuz berdi");
      }
    }
  };\n\n  ` + handleDeleteCode
);

// modify filtered logic
code = code.replace(
  "const filtered = students.filter(s => {",
  `const filtered = students.filter(s => {
    const isArchived = s.status === 'archived';
    if (activeTab === 'active' && isArchived) return false;
    if (activeTab === 'archived' && !isArchived) return false;`
);

// add tabs UI
code = code.replace(
  `<div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--theme-text-primary)]/40" size={18} />`,
  `<div className="flex gap-4 border-b border-white/10 mb-6 shrink-0">
        <button 
          onClick={() => setActiveTab('active')} 
          className={\`pb-3 font-bold text-sm transition-colors relative \${activeTab === 'active' ? 'text-[#FEC204]' : 'text-white/50 hover:text-white'}\`}
        >
          Faol o'quvchilar
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FEC204] rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('archived')} 
          className={\`pb-3 font-bold text-sm transition-colors relative \${activeTab === 'archived' ? 'text-[#FEC204]' : 'text-white/50 hover:text-white'}\`}
        >
          Arxivlangan o'quvchilar
          {activeTab === 'archived' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FEC204] rounded-t-full"></div>}
        </button>
      </div>
      <div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--theme-text-primary)]/40" size={18} />`
);

// add archive button to card actions
code = code.replace(
  `<button onClick={(e) => handleDelete(e, student.id, student.fullName)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors">
                    <Trash2 size={14} />
                  </button>`,
  `<button onClick={(e) => handleArchive(e, student.id, student.fullName, student.status === 'archived')} className="w-8 h-8 flex items-center justify-center bg-orange-500/10 text-orange-400 rounded-full hover:text-orange-300 hover:bg-orange-500/20 transition-colors" title={student.status === 'archived' ? "Faollashtirish" : "Arxivlash"}>
                    {student.status === 'archived' ? <CheckCircle2 size={14} /> : <Archive size={14} />}
                  </button>
                  <button onClick={(e) => handleDelete(e, student.id, student.fullName)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors">
                    <Trash2 size={14} />
                  </button>`
);

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
