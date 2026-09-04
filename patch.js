const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');

code = code.replace(
`    let navItems = [
    { to: ".", icon: <Home size={22} />, label: "Asosiy" },
    { to: "payments", icon: <CreditCard size={22} />, label: "To'lov" },
    { to: "more", icon: <BookOpen size={22} />, label: "Boshqa" },
    { to: "milliy-sertifikat", icon: <Award size={22} />, label: "Milliy Sertifikat" },
    { to: "sat", icon: <Database size={22} />, label: "SAT BAZA" },
    { to: "tests", icon: <Database size={22} />, label: "Testlar bazasi" },
    { to: "exams", icon: <FileText size={22} />, label: "Imtihonlar" },
    { to: "homeworks", icon: <FileText size={22} />, label: "Vazifalar" },
    { to: "news", icon: <Megaphone size={22} />, label: "Yangiliklar" },
  ];`,
`    let navItems = [
    { to: ".", icon: <Home size={22} />, label: "Asosiy" },
    { to: "payments", icon: <CreditCard size={22} />, label: "To'lov" },
    { to: "milliy-sertifikat", icon: <Award size={22} />, label: "Milliy Sertifikat" },
    { to: "sat", icon: <Database size={22} />, label: "SAT BAZA" },
    { to: "tests", icon: <Database size={22} />, label: "Testlar bazasi" },
    { to: "exams", icon: <FileText size={22} />, label: "Imtihonlar" },
    { to: "homeworks", icon: <FileText size={22} />, label: "Vazifalar" },
    { to: "news", icon: <Megaphone size={22} />, label: "Yangiliklar" },
    { to: "more", icon: <BookOpen size={22} />, label: "Boshqa" },
  ];`
);

fs.writeFileSync('src/components/AdminLayout.tsx', code);
