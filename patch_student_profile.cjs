const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf-8');

// Add imports
code = code.replace(/import \{ Phone, Mail, BookOpen, CalendarIcon, Download \} from 'lucide-react';/, 
                    "import { Phone, Mail, BookOpen, CalendarIcon, Download, Users } from 'lucide-react';\nimport { useNavigate } from 'react-router-dom';");

// Add useNavigate and logout
code = code.replace(/const \{ user \} = useAuth\(\);/, 
                    "const { user, logout } = useAuth();\n  const navigate = useNavigate();");

// Add handleSwitchAccount
code = code.replace(/const handleInstallClick = \(\) => \{[^}]+\};/g, 
                    `const handleInstallClick = () => {};
  
  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login', { replace: true });
  };`);

// Replace the stats section
const targetStats = `      <div className="grid grid-cols-3 gap-2 mt-8">
        <div className="glass-panel p-4 flex flex-col items-center justify-center p-3">
          <p className="text-[16px] font-[900] text-white tracking-[-0.5px]">{attendanceRate}%</p>
          <p className="text-[9px] uppercase tracking-[1px] font-bold text-[#a07800] mt-1">Davomat</p>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center p-3">
          <p className="text-[16px] font-[900] text-[color:var(--success-color)] tracking-[-0.5px] capitalize">{userStatus}</p>
          <p className="text-[9px] uppercase tracking-[1px] font-bold text-green-700 mt-1">Holati</p>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center p-3">
          <p className="text-[16px] font-[900] text-white tracking-[-0.5px]">{monthsCount}</p>
          <p className="text-[9px] uppercase tracking-[1px] font-bold text-blue-600 mt-1">Oylar soni</p>
        </div>
      </div>`;

const replaceStats = `      <div className="mt-8 px-1">
        <button 
          onClick={handleSwitchAccount}
          className="w-full glass-panel flex flex-col items-center justify-center p-4 hover:bg-white/5 active:scale-95 transition-all group border-white/5"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-[#FEC204] group-hover:text-black transition-colors">
             <Users size={18} />
          </div>
          <p className="text-[14px] font-[900] text-white tracking-wide">Boshqa akkauntga kirish</p>
          <p className="text-[10px] uppercase font-bold text-white/40 mt-1">Akkauntni almashtirish</p>
        </button>
      </div>`;

code = code.replace(targetStats, replaceStats);

fs.writeFileSync('src/pages/student/StudentProfile.tsx', code);
