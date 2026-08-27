const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateBuilder.tsx', 'utf-8');

// Change grid columns if needed, but wait, I can just change the bubbles first.
code = code.replace(
  'className="flex gap-2 w-full justify-center flex-wrap"',
  'className="flex gap-1.5 sm:gap-2 w-full justify-center flex-wrap"'
);

code = code.replace(
  /className=\{`w-10 h-10 rounded-full font-bold/g,
  'className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-sm'
);

fs.writeFileSync('src/pages/admin/AdminCertificateBuilder.tsx', code);
