const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');

if (!code.includes("import AdminAddStudentModal")) {
  code = code.replace(
    "import { LogOut, X, QrCode } from 'lucide-react';",
    "import { LogOut, X, QrCode, UserPlus } from 'lucide-react';\nimport AdminAddStudentModal from './AdminAddStudentModal';"
  );
  
  code = code.replace(
    "const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);",
    "const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);\n  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);"
  );

  // Desktop Button
  code = code.replace(
    `{isStudentsPage && (
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="h-11 px-4 rounded-2xl bg-[rgba(254,194,4,0.1)] flex items-center gap-2 text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20 font-bold text-[13px] mr-2"
              >
                <QrCode size={18} />
                <span>O'quvchi qabul qilish</span>
              </button>
            )}`,
    `{isStudentsPage && (
              <div className="flex items-center gap-2 mr-2">
                <button 
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="h-11 px-4 rounded-2xl bg-[rgba(254,194,4,0.1)] flex items-center gap-2 text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20 font-bold text-[13px]"
                >
                  <UserPlus size={18} />
                  <span>O'quvchi qo'shish</span>
                </button>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="h-11 px-4 rounded-2xl bg-[rgba(254,194,4,0.1)] flex items-center gap-2 text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20 font-bold text-[13px]"
                >
                  <QrCode size={18} />
                  <span>O'quvchi qabul qilish</span>
                </button>
              </div>
            )}`
  );

  // Mobile Button
  code = code.replace(
    `{isStudentsPage && (
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="w-10 h-10 rounded-2xl bg-[rgba(254,194,4,0.1)] flex items-center justify-center text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20"
                title="O'quvchi qabul qilish"
              >
                <QrCode size={18} />
              </button>
            )}`,
    `{isStudentsPage && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="w-10 h-10 rounded-2xl bg-[rgba(254,194,4,0.1)] flex items-center justify-center text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20"
                  title="O'quvchi qo'shish"
                >
                  <UserPlus size={18} />
                </button>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-10 h-10 rounded-2xl bg-[rgba(254,194,4,0.1)] flex items-center justify-center text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20"
                  title="O'quvchi qabul qilish"
                >
                  <QrCode size={18} />
                </button>
              </div>
            )}`
  );

  code = code.replace(
    `{isInviteModalOpen && (`,
    `{isAddStudentModalOpen && <AdminAddStudentModal onClose={() => setIsAddStudentModalOpen(false)} />}
        {isInviteModalOpen && (`
  );
}

fs.writeFileSync('src/components/AdminLayout.tsx', code);
