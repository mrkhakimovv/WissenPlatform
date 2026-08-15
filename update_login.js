import fs from 'fs';
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

if (!code.includes('usePWAInstall')) {
  code = code.replace(
    "import { User, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';",
    "import { User, Lock, Eye, EyeOff, GraduationCap, Download } from 'lucide-react';\nimport { usePWAInstall } from '../hooks/usePWAInstall';"
  );
  
  code = code.replace(
    "const navigate = useNavigate();",
    "const navigate = useNavigate();\n  const { isInstallable, installApp } = usePWAInstall();"
  );

  const buttonHtml = `
      {isInstallable && (
        <button 
          onClick={installApp}
          type="button"
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-[#FEC204] text-black font-bold text-[12px] uppercase tracking-wide rounded-full shadow-lg hover:bg-[#e0ab00] transition-colors z-50"
        >
          <Download size={16} />
          APK O'rnatish
        </button>
      )}
  `;

  code = code.replace(
    /<div className="flex-1 flex flex-col px-6 relative overflow-y-auto z-20">/,
    '<div className="flex-1 flex flex-col px-6 relative overflow-y-auto z-20">\n' + buttonHtml
  );

  fs.writeFileSync('src/pages/Login.tsx', code);
}
