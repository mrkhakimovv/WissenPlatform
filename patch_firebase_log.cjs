const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(/setLogLevel\('error'\);/, "setLogLevel('silent');");

fs.writeFileSync('src/lib/firebase.ts', code);
