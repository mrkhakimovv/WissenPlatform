import fs from 'fs';
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

if (!code.includes("import { usePWAInstall }")) {
  code = code.replace(
    "import { GraduationCap, Lock, User, Eye, EyeOff } from 'lucide-react';",
    "import { GraduationCap, Lock, User, Eye, EyeOff, Download } from 'lucide-react';\nimport { usePWAInstall } from '../hooks/usePWAInstall';"
  );
  fs.writeFileSync('src/pages/Login.tsx', code);
}
