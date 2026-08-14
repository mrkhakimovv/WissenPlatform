import fs from 'fs';
let code = fs.readFileSync('firestore.rules', 'utf8');

const matchTests = `    match /tests/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }`;

const matchExamResults = `    match /exam_results/{document=**} {
      allow read: if request.auth != null && (isAdmin() || resource.data.studentId == request.auth.uid);
      allow write: if request.auth != null;
    }`;

if (!code.includes("match /exam_results")) {
  code = code.replace(matchTests, matchTests + '\n\n' + matchExamResults);
  fs.writeFileSync('firestore.rules', code);
}
