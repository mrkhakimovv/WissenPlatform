const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf-8');
code = code.replace(
  'if (await confirm("Haqiqatan ham bu o\'quvchining natijasini o\'chirib yubormoqchimisiz? O\'chirilgach natijalar boshqadan hisoblanadi.")) {',
  'if (await confirm({ title: "O\'chirish", message: "Haqiqatan ham bu o\'quvchining natijasini o\'chirib yubormoqchimisiz? O\'chirilgach natijalar boshqadan hisoblanadi." })) {'
);
fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
