const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');
code = code.replace("console.error('User doc not found in Firestore');", "console.warn('User doc not found in Firestore, signing out.');");
fs.writeFileSync('src/contexts/AuthContext.tsx', code);
