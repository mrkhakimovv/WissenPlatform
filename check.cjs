const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateBuilder.tsx', 'utf-8');
console.log(code.substring(3700, 4200));
