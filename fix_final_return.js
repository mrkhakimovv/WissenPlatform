import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace(
  'return (\n    <div className="fixed inset-0 bg-[#0d0d0d] z-[200] flex flex-col select-none">',
  'return <>{createPortal(\n    <div ref={containerRef} className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex flex-col select-none">'
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
