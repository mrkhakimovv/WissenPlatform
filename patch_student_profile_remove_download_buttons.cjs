const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf-8');

const targetStr = `      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        <button 
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
        >
          <Download size={18} />
          <span>Ekranga qo'shish (PWA)</span>
        </button>

        <a 
          href="/wissen-edu.apk"
          download="wissen-edu.apk"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FEC204] text-black font-bold hover:bg-[#e0ab00] transition-colors"
        >
          <Download size={18} />
          <span>Ilovani yuklab olish (.APK)</span>
        </a>
      </div>`;

code = code.replace(targetStr, '');

fs.writeFileSync('src/pages/student/StudentProfile.tsx', code);
