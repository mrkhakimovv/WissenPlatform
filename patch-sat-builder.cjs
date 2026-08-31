const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');

code = code.replace(
  "const isBubbleMode = testData.satType === 'SAT Homework' || testData.satType === 'SAT practice';",
  "const isBubbleMode = testData.isFastMode || testData.satType === 'SAT Homework' || testData.satType === 'SAT practice';"
);

fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code);
