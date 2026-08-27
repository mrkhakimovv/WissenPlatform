const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateBuilder.tsx', 'utf-8');

code = code.replace(
  'className="flex gap-1.5 xl:gap-2 w-full justify-center flex-wrap"',
  'className="flex gap-1 sm:gap-1.5 xl:gap-2 w-full justify-center flex-wrap"'
);

code = code.replace(
  /w-9 h-9 xl:w-10 xl:h-10 text-sm xl:text-base/g,
  'w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 text-xs sm:text-sm xl:text-base shrink-0'
);

fs.writeFileSync('src/pages/admin/AdminCertificateBuilder.tsx', code);
