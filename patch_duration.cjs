const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

code = code.replace(
  `duration: 'Cheklanmagan'`,
  `duration: 0`
);
fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
