const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
if (!code.includes("console.log('Final Firebase Config:'")) {
  code = code.replace("const app = initializeApp(firebaseConfig);", "console.log('Final Firebase Config:', firebaseConfig);\nconst app = initializeApp(firebaseConfig);");
  fs.writeFileSync('src/lib/firebase.ts', code);
}
