const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

const targetStr = `      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Juda ko'p urinish. Iltimos biroz kuting.";
      }`;

const replaceStr = `      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Juda ko'p urinish. Iltimos biroz kuting.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Tarmoq xatosi. Internet aloqasini tekshiring yoki Adblockerni o'chiring.";
      }`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
