import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf8');

if (!code.includes("setDoc")) {
  code = code.replace(
    "import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from '../../lib/firebase';",
    "import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, setDoc } from '../../lib/firebase';"
  );
}

code = code.replace(
  `        await addDoc(collection(db, 'exams'), {
          ...dataToSave,
          createdAt: new Date().toISOString()
        });`,
  `        const newDocRef = doc(collection(db, 'exams'));
        await setDoc(newDocRef, {
          ...dataToSave,
          id: newDocRef.id,
          createdAt: new Date().toISOString()
        });`
);

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
