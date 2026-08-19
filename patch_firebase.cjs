const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(
  /export const db = getFirestore\(app, firestoreDatabaseId\);/,
  "import { initializeFirestore } from 'firebase/firestore';\nexport const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firestoreDatabaseId);"
);

fs.writeFileSync('src/lib/firebase.ts', code);
