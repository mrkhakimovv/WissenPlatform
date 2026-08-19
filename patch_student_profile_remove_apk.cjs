const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf-8');

const targetStr = `        <button 
          onClick={handleInstallClick}
          className="absolute top-0 left-0 flex items-center gap-2 px-3 py-1.5 bg-[#FEC204] text-black font-bold text-[11px] uppercase tracking-wide rounded-full shadow-lg hover:bg-[#e0ab00] transition-colors z-10"
        >
          <Download size={14} />
          APK O'rnatish
        </button>`;

code = code.replace(targetStr, '');

fs.writeFileSync('src/pages/student/StudentProfile.tsx', code);
