const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Replace the line 354-ish area
code = code.replace(
  /(\s*\)\s*:\s*\(\s*<>\s*<div className="mb-4">\s*<p[^>]*>Barcha yaratilgan testlar to'plami<\/p>)/,
  `        ) : activeTab === 'base' ? ( 
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami</p>`
);

// Now for the second replacement I did, where I replaced `</>\n        )}` with `</>\n        ) : ( ... )}`
// The problem is my previous script DID run successfully, so it added the `lessons` branch at the end of the file somewhere.
// Let's find where it added it and fix the syntax error!
