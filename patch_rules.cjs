const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');
const newRule = `    match /sat_lessons/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Default deny`;

rules = rules.replace('    // Default deny', newRule);
fs.writeFileSync('firestore.rules', rules);
