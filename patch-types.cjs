const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(
  "syntheticEnabled?: boolean; // qo'shimcha (sintetik) o'quvchilar qo'shilsinmi",
  "syntheticEnabled?: boolean; // qo'shimcha (sintetik) o'quvchilar qo'shilsinmi\n  allowedRetakes?: string[]; // o'chirilganidan keyin qayta topshirishga ruxsat berilgan o'quvchilar ID lari"
);
fs.writeFileSync('src/types.ts', code);
