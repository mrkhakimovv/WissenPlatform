import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace(/text-\\[15px\\] md:text-\\[20px\\]/g, 'text-[14px] md:text-[20px]');

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log("Updated Test Take Fonts");
