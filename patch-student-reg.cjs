const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentRegistration.tsx', 'utf-8');

code = code.replace(
  `catch (loginErr) {
          toast.error("Ushbu username band yoki parol noto'g'ri. Agar bu sizning akkauntingiz bo'lsa, to'g'ri parolni kiritib kiring.");`,
  `catch (loginErr: any) {
          if (loginErr.message.includes('arxivlangan')) {
            toast.error(loginErr.message);
          } else {
            toast.error("Ushbu username band yoki parol noto'g'ri. Agar bu sizning akkauntingiz bo'lsa, to'g'ri parolni kiritib kiring.");
          }`
);

fs.writeFileSync('src/pages/StudentRegistration.tsx', code);
