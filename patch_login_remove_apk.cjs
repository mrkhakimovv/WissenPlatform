const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

const targetStr = `      {isInstallable && (
        <button 
          onClick={installApp}
          type="button"
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-[#FEC204] text-black font-bold text-[12px] uppercase tracking-wide rounded-full shadow-lg hover:bg-[#e0ab00] transition-colors z-50"
        >
          <Download size={16} />
          APK O'rnatish
        </button>
      )}`;

code = code.replace(targetStr, '');

fs.writeFileSync('src/pages/Login.tsx', code);
