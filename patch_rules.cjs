const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

const target = `    match /news/{document=**} {`;
const insert = `    match /notifications/{id} {
      allow read: if request.auth != null;
      allow create, delete: if isAdmin();
      allow update: if request.auth != null;
    }

    match /news/{document=**} {`;
code = code.replace(target, insert);

fs.writeFileSync('firestore.rules', code);
