const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(
  /export const auth = getAuth\(app\);/,
  `import { initializeAuth, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence } from 'firebase/auth';
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence]
});`
);

code = code.replace(
  /export const secondaryAuth = getAuth\(secondaryApp\);/,
  `export const secondaryAuth = initializeAuth(secondaryApp, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence]
});`
);

fs.writeFileSync('src/lib/firebase.ts', code);
