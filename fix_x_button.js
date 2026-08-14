import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace(
  'if(window.confirm("Agar oyna yopilsa test avtomatik tugatiladi va joriy belgilangan javoblar hisoblanadi. Yopmoqchimisiz?")) { handleSubmit(); setTimeout(() => onClose(), 2000); }',
  'if(window.confirm("Agar oyna yopilsa test avtomatik tugatiladi va joriy belgilangan javoblar hisoblanadi. Yopmoqchimisiz?")) { handleSubmit(); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); setTimeout(() => onClose(), 2000); }'
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
