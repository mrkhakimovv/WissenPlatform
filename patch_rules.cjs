const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const oldNewsRule = `    match /news/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }`;

const newNewsRule = `    match /news/{document=**} {
      allow read: if request.auth != null;
      allow create, delete: if isAdmin();
      allow update: if request.auth != null;
    }`;

if (rules.includes(oldNewsRule)) {
    rules = rules.replace(oldNewsRule, newNewsRule);
    fs.writeFileSync('firestore.rules', rules);
    console.log("firestore.rules updated successfully.");
} else {
    console.log("Could not find the exact old rule string.");
}
