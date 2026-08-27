const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

code = code.replace(
  /catch \(e\) \{[\s\S]*?toast\.error\("Xatolik yuz berdi"\);/m,
  `catch (e: any) {
      console.error("SUBMIT ERROR:", e);
      toast.error("Xatolik yuz berdi: " + (e.message || String(e)));`
);

fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
