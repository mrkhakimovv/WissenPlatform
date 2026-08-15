import fs from 'fs';
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  "import { getFirestore,", 
  "import { getFirestore, setLogLevel,"
);

code = code.replace(
  "const app = initializeApp(firebaseConfig);",
  "// Tarmoq uzilishi ogohlantirishlarini yashirish\nsetLogLevel('error');\n\nconst app = initializeApp(firebaseConfig);"
);

fs.writeFileSync('src/lib/firebase.ts', code);
