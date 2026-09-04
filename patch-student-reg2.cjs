const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentRegistration.tsx', 'utf-8');

code = code.replace(
  `catch (loginErr) {
            // Parol xato bo'lsa, demak bu nom rostdan ham boshqa birovga tegishli yoki parol unutilgan.
            setUsernameStatus('taken');
            toast.error(\`Bu username band. Iltimos: \${username}1 yoki \${username}_2026 deb kiritib ko'ring.\`);
            setSubmitting(false);
            return;
          }`,
  `catch (loginErr: any) {
            if (loginErr.message && loginErr.message.includes('arxivlangan')) {
              toast.error(loginErr.message);
            } else {
              setUsernameStatus('taken');
              toast.error(\`Bu username band. Iltimos: \${username}1 yoki \${username}_2026 deb kiritib ko'ring.\`);
            }
            setSubmitting(false);
            return;
          }`
);

fs.writeFileSync('src/pages/StudentRegistration.tsx', code);
