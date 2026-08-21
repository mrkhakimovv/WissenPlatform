const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf-8');

const importTarget = `import { usePWAInstall } from '../../hooks/usePWAInstall';`;
const newImport = `import { usePWAInstall } from '../../hooks/usePWAInstall';
import { requestNotificationPermission } from '../../lib/messaging';
import { Bell } from 'lucide-react';`;
code = code.replace(importTarget, newImport);

const uiTarget = `      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">O'quv ma'lumotlari</h2>`;

const newUi = `      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">Bildirishnomalar</h2>
        <div className="glass-panel p-4 !p-2 space-y-1">
          <button 
            onClick={() => requestNotificationPermission()}
            className="w-full flex items-center justify-between p-3 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#FEC204]/10 flex items-center justify-center text-[#FEC204]"><Bell size={16} /></div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-[700] text-white">Bildirishnomalarni yoqish</p>
                <p className="text-[10px] font-bold text-white/40">Yangi xabarlarni o'tkazib yubormaslik uchun</p>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">O'quv ma'lumotlari</h2>`;
code = code.replace(uiTarget, newUi);

fs.writeFileSync('src/pages/student/StudentProfile.tsx', code);
