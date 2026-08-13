import fs from 'fs';

let code = fs.readFileSync('src/components/StudentLayout.tsx', 'utf-8');

// Remove profile from navItems
code = code.replace(/\{ to: "profile", icon: <User size=\{22\} \/>, label: "Profil" \},\n/, '');

fs.writeFileSync('src/components/StudentLayout.tsx', code);
