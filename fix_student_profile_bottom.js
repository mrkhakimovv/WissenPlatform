import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf8');

const bottomButton = `
      {isInstallable && (
        <button 
          onClick={installApp}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FEC204] text-black font-bold hover:bg-[#e0ab00] transition-colors mt-6"
        >
          <Download size={18} />
          <span>Ilovani yuklab olish (APK)</span>
        </button>
      )}
      <p className="text-center text-[10px] font-bold text-white/40 py-4">Wissen Edu v1.0.0</p>
`;

code = code.replace(
  /<p className="text-center text-\[10px\] font-bold text-white\/40 py-4">Wissen Edu v1\.0\.0<\/p>/,
  bottomButton.trim()
);

fs.writeFileSync('src/pages/student/StudentProfile.tsx', code);
