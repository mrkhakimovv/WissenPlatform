const fs = require('fs');
let typesContent = fs.readFileSync('src/types.ts', 'utf8');
if(!typesContent.includes('password?: string;')) {
    typesContent = typesContent.replace('dailyUsage?: Record<string, number>;', 'dailyUsage?: Record<string, number>;\n  password?: string;');
    fs.writeFileSync('src/types.ts', typesContent);
    console.log("Types updated");
}

let profileContent = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf8');

const loginBlockEnd = `            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">Login</p>
              <p className="text-[13px] font-[700] text-white">{user?.username}</p>
            </div>
          </div>`;

if(profileContent.includes(loginBlockEnd) && !profileContent.includes('Parol</p>')) {
    const passwordBlock = `
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-red-50 flex items-center justify-center text-red-500"><Lock size={16} /></div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-white/40">Parol</p>
                <p className="text-[13px] font-[700] text-white">{user?.password || 'Ko\\'rsatilmagan'}</p>
              </div>
            </div>
          </div>`;
          
    profileContent = profileContent.replace(loginBlockEnd, loginBlockEnd + passwordBlock);
    
    // Also we need to import Lock from lucide-react if not present
    if(!profileContent.includes('Lock')) {
       profileContent = profileContent.replace("from 'lucide-react';", ", Lock } from 'lucide-react';");
    }
    
    fs.writeFileSync('src/pages/student/StudentProfile.tsx', profileContent);
    console.log("Profile updated");
}
