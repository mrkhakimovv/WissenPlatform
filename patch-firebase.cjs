const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(
  'import { initializeFirestore } from "firebase/firestore";',
  'import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";'
);

code = code.replace(
  `export const db = initializeFirestore(
  app,
  { experimentalAutoDetectLongPolling: true },
  firestoreDatabaseId,
);`,
  `export const db = initializeFirestore(
  app,
  { 
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  },
  firestoreDatabaseId,
);`
);

fs.writeFileSync('src/lib/firebase.ts', code);
