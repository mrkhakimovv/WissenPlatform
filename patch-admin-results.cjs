const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf-8');

if (!code.includes('import { arrayUnion } from')) {
  code = code.replace(
    "import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';",
    "import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';"
  );
}

// Replace the updateDoc calls to include allowedRetakes
code = code.replace(
  'await updateDoc(doc(db, "exams", exam.id), { raschReport: computeRaschWithReference(matrix, syntheticData, false) });',
  'await updateDoc(doc(db, "exams", exam.id), { raschReport: computeRaschWithReference(matrix, syntheticData, false), allowedRetakes: arrayUnion(studentId) });'
);
code = code.replace(
  'await updateDoc(doc(db, "exams", exam.id), { raschReport: newRep });',
  'await updateDoc(doc(db, "exams", exam.id), { raschReport: newRep, allowedRetakes: arrayUnion(studentId) });'
);
code = code.replace(
  'await updateDoc(doc(db, "exams", exam.id), { raschReport: null });',
  'await updateDoc(doc(db, "exams", exam.id), { raschReport: null, allowedRetakes: arrayUnion(studentId) });'
);

// Second raschReport: null
code = code.replace(
  'await updateDoc(doc(db, "exams", exam.id), { raschReport: null });',
  'await updateDoc(doc(db, "exams", exam.id), { raschReport: null, allowedRetakes: arrayUnion(studentId) });'
);

fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
