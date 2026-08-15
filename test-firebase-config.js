import fs from 'fs';
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
code = code.replace("const app = initializeApp(firebaseConfig);", "console.log('FB CONFIG:', firebaseConfig);\nconst app = initializeApp(firebaseConfig);");
fs.writeFileSync('src/lib/firebase.ts', code);
