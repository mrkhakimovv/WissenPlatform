import fs from 'fs';
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

code = code.replace(
  `{ to: "exams", icon: <FileText size={22} />, label: "Imtihonlar" },`,
  `{ to: "tests", icon: <Database size={22} />, label: "Testlar bazasi" },\n    { to: "exams", icon: <FileText size={22} />, label: "Imtihonlar" },`
);

if (!code.includes("import { Database")) {
  code = code.replace(
    `import { Users, Layers, Home, CreditCard, LogOut, CalendarDays, BookOpen, UserPlus, Shield, Bell, Settings, ClipboardList, Megaphone, FileText, QrCode, X, Copy, CheckCircle2 } from 'lucide-react';`,
    `import { Users, Layers, Home, CreditCard, LogOut, CalendarDays, BookOpen, UserPlus, Shield, Bell, Settings, ClipboardList, Megaphone, FileText, QrCode, X, Copy, CheckCircle2, Database } from 'lucide-react';`
  );
}

fs.writeFileSync('src/components/AdminLayout.tsx', code);
