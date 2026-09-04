const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

code = code.replace(
  "const data = userDoc.data();",
  `const data = userDoc.data();
        if (data.status === 'archived') {
          await signOut(auth);
          throw new Error("Ushbu akkaunt arxivlangan arxivdan chiqarish uchun adminga murojaat qiling");
        }`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
