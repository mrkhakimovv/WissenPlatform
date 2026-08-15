import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf8');

if (!code.includes('usePWAInstall')) {
  code = code.replace(
    "import { Phone, Mail, BookOpen, CalendarIcon } from 'lucide-react';",
    "import { Phone, Mail, BookOpen, CalendarIcon, Download } from 'lucide-react';\nimport { usePWAInstall } from '../../hooks/usePWAInstall';"
  );
  
  code = code.replace(
    "const [monthsCount, setMonthsCount] = useState<number>(0);",
    "const [monthsCount, setMonthsCount] = useState<number>(0);\n  const { isInstallable, installApp } = usePWAInstall();"
  );

  const buttonHtml = `
      {isInstallable && (
        <button 
          onClick={installApp}
          className="absolute top-0 left-0 mt-2 flex items-center gap-2 px-3 py-1.5 bg-[#FEC204] text-black font-bold text-[11px] uppercase tracking-wide rounded-full shadow-lg hover:bg-[#e0ab00] transition-colors"
        >
          <Download size={14} />
          Yuklab olish
        </button>
      )}
  `;

  code = code.replace(
    /<div className="relative mb-4">/,
    '<div className="w-full flex justify-center relative">\n' + buttonHtml + '\n        <div className="relative mb-4">'
  );
  
  code = code.replace(
    /<div className="flex flex-col items-center">/,
    '<div className="flex flex-col items-center relative">'
  );

  fs.writeFileSync('src/pages/student/StudentProfile.tsx', code);
}
