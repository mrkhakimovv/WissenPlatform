import fs from 'fs';

let code = fs.readFileSync('src/components/StudentLayout.tsx', 'utf-8');

// Import useState if not imported
if (!code.includes('useState')) {
  code = code.replace(/import React from 'react';/, "import React, { useState } from 'react';");
}

code = code.replace(/import \{ useNavigate \} from 'react-router-dom';/, "import { useNavigate } from 'react-router-dom';\nimport StudentProfile from '../pages/student/StudentProfile';\nimport { X } from 'lucide-react';");

code = code.replace(/const isProfile = location\.pathname\.endsWith\('\/profile'\);/, "const isProfile = location.pathname.endsWith('/profile');\n  const [isProfileOpen, setIsProfileOpen] = useState(false);");

// Make top right header clickable
code = code.replace(/<div className="flex items-center gap-4">/, '<div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileOpen(true)}>');

// Make mobile header clickable
code = code.replace(/<div className="flex items-center gap-3 shrink-0 ml-2">/, '<div className="flex items-center gap-3 shrink-0 ml-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileOpen(true)}>');

// Add the slideover at the end of the return statement
code = code.replace(/    <\/div>\n  \);\n\}\n$/, `
      {/* Profile Slideover */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0d0d0d] border-l border-white/5 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
             <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
               <h2 className="text-lg font-bold text-white">Profil</h2>
               <button onClick={() => setIsProfileOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                 <X size={18} />
               </button>
             </div>
             <div className="flex-1 overflow-y-auto p-5">
               <StudentProfile />
             </div>
             
             <div className="p-5 border-t border-white/5 shrink-0">
                <button 
                  onClick={handleLogout}
                  className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Tizimdan chiqish</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

fs.writeFileSync('src/components/StudentLayout.tsx', code);
