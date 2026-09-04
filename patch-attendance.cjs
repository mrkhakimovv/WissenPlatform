const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAttendance.tsx', 'utf-8');

code = code.replace(
  "import { ChevronLeft, Users } from 'lucide-react';",
  "import { ChevronLeft, Users, Archive } from 'lucide-react';"
);

code = code.replace(
  "const toggleAttendance = async (studentId: string, day: number) => {",
  `const handleArchive = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if(await confirm({ title: 'Diqqat', message: \`\${name} ni arxivlamoqchimisiz?\` })) {
      try {
        await updateDoc(doc(db, 'users', id), { status: 'archived' });
        toast.success("Arxivlandi");
      } catch (err: any) {
        toast.error("Xatolik yuz berdi");
      }
    }
  };

  const toggleAttendance = async (studentId: string, day: number) => {`
);

const svgToReplace = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>`;

code = code.replace(
  `<div className="w-6 h-6 rounded flex items-center justify-center text-white/20">
                                                 ${svgToReplace}
                                              </div>`,
  `<button 
                                                onClick={(e) => handleArchive(e, student.id, student.fullName)}
                                                className="w-6 h-6 rounded flex items-center justify-center text-white/20 hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
                                                title="Arxivlash"
                                              >
                                                 <Archive size={14} />
                                              </button>`
);

fs.writeFileSync('src/pages/admin/AdminAttendance.tsx', code);
