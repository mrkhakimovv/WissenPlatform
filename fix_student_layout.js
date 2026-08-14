import fs from 'fs';
let code = fs.readFileSync('src/components/StudentLayout.tsx', 'utf8');

if (!code.includes('{ to: "results"')) {
  code = code.replace(
    /import \{ Home, CreditCard, CalendarCheck, CalendarDays, User, LogOut, FileText, GraduationCap \} from 'lucide-react';/,
    "import { Home, CreditCard, CalendarCheck, CalendarDays, User, LogOut, FileText, GraduationCap, BarChart2 } from 'lucide-react';"
  );
  
  code = code.replace(
    /\{ to: "exams", icon: <GraduationCap size=\{22\} \/>, label: "Imtihonlar" \},/,
    '{ to: "exams", icon: <GraduationCap size={22} />, label: "Imtihonlar" },\n    { to: "results", icon: <BarChart2 size={22} />, label: "Natijalar" },'
  );

  fs.writeFileSync('src/components/StudentLayout.tsx', code);
}
