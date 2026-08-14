import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace("import React from 'react';\nimport { createPortal }", "import { createPortal }");

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
