import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');

const testsRule = `
    match /tests/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
`;

rules = rules.replace('// Default deny', testsRule + '\n    // Default deny');
fs.writeFileSync('firestore.rules', rules);
