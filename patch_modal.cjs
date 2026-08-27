const fs = require('fs');
let code = fs.readFileSync('src/components/ui/Modal.tsx', 'utf8');
code = code.replace('z-50 flex', 'z-[10000] flex');
fs.writeFileSync('src/components/ui/Modal.tsx', code);
console.log("Patched Modal z-index");
