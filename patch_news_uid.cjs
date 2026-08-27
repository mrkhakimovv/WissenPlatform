const fs = require('fs');

['src/pages/admin/AdminNews.tsx', 'src/pages/student/StudentNews.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/user\?\.uid/g, "user?.id");
  fs.writeFileSync(file, code);
  console.log(`Patched ${file}`);
});
