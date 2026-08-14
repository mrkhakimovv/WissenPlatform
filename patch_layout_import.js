import fs from 'fs';
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

code = code.replace(
  "import { Home, Users, CreditCard, CalendarCheck, BookOpen, Layers, LogOut, FileText, Megaphone, QrCode, X, Copy, CheckCircle2 } from 'lucide-react';",
  "import { Home, Users, CreditCard, CalendarCheck, BookOpen, Layers, LogOut, FileText, Megaphone, QrCode, X, Copy, CheckCircle2, Database } from 'lucide-react';"
);

fs.writeFileSync('src/components/AdminLayout.tsx', code);
