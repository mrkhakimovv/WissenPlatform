const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

code = code.replace(
  "allow get: if request.auth != null && (request.auth.uid == userId || isAdmin());",
  "allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());"
);

fs.writeFileSync('firestore.rules', code);
