const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
code = code.replace("const configAny = localFirebaseConfig as any;", "const configAny = (localFirebaseConfig as any).default || localFirebaseConfig as any;");
fs.writeFileSync('src/lib/firebase.ts', code);
