const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

code = code.replace(
  "satType: 'SAT Mavzulashtirilgan',",
  "satType: 'SAT Mavzulashtirilgan',\n    isFastMode: false,"
);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
