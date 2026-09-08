const fs = require('fs');

// Patch StudentLayout
let studentCode = fs.readFileSync('src/components/StudentLayout.tsx', 'utf-8');
studentCode = studentCode.replace(
  `import { Database, Home, CreditCard, CalendarCheck, CalendarDays, User, LogOut, FileText, GraduationCap, BarChart2, Megaphone, Award } from 'lucide-react';`,
  `import { Database, Home, CreditCard, CalendarCheck, CalendarDays, User, LogOut, FileText, GraduationCap, BarChart2, Megaphone, Award, Globe } from 'lucide-react';`
);
studentCode = studentCode.replace(
  `{ to: "sat", icon: <Database size={22} />, label: "SAT" },`,
  `{ to: "sat", icon: <Globe size={22} />, label: "SAT" },`
);
fs.writeFileSync('src/components/StudentLayout.tsx', studentCode);

// Patch AdminLayout
let adminCode = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');
adminCode = adminCode.replace(
  `import { Home, Users, CreditCard, CalendarCheck, BookOpen, Layers, LogOut, FileText, Megaphone, QrCode, X, Copy, CheckCircle2, Database, Award , UserPlus } from 'lucide-react';`,
  `import { Home, Users, CreditCard, CalendarCheck, BookOpen, Layers, LogOut, FileText, Megaphone, QrCode, X, Copy, CheckCircle2, Database, Award , UserPlus, Globe } from 'lucide-react';`
);
adminCode = adminCode.replace(
  `{ to: "sat", icon: <Database size={22} />, label: "SAT BAZA" },`,
  `{ to: "sat", icon: <Globe size={22} />, label: "SAT BAZA" },`
);
fs.writeFileSync('src/components/AdminLayout.tsx', adminCode);

