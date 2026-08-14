import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace(/return createPortal\(/g, 'return <>{createPortal(');
code = code.replace(/document\.body\n    \);/g, 'document.body\n    )}</>;');
code = code.replace(/document\.body\n  \);/g, 'document.body\n  )}</>;');

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
