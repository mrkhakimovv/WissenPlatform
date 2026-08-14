import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace(
  'await document.documentElement.requestFullscreen();',
  'if (containerRef.current) await containerRef.current.requestFullscreen(); else await document.documentElement.requestFullscreen();'
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
