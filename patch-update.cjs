const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf-8');

if (!code.includes('updateDoc')) {
  code = code.replace("import { doc, deleteDoc } from 'firebase/firestore';", "import { doc, deleteDoc, updateDoc } from 'firebase/firestore';");
}

code = code.replace(
  'setReport(computeRaschWithReference(matrix, syntheticData, true));',
  'const newRep = computeRaschWithReference(matrix, syntheticData, true);\n              setReport(newRep);\n              await updateDoc(doc(db, "exams", exam.id), { raschReport: computeRaschWithReference(matrix, syntheticData, false) });'
);

code = code.replace(
  'setReport(computeRaschReport(matrix));',
  'const newRep = computeRaschReport(matrix);\n              setReport(newRep);\n              await updateDoc(doc(db, "exams", exam.id), { raschReport: newRep });'
);

code = code.replace(
  'setReport(null);\n          }\n        } else {\n          setReport(null);\n        }',
  'setReport(null);\n            await updateDoc(doc(db, "exams", exam.id), { raschReport: null });\n          }\n        } else {\n          setReport(null);\n          await updateDoc(doc(db, "exams", exam.id), { raschReport: null });\n        }'
);

fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
