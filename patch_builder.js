import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf8');

code = code.replace(
  "import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';",
  "import { collection, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';"
);

code = code.replace(
  `         await addDoc(collection(db, 'tests'), {
            ...testData,
            createdAt: new Date().toISOString()
         });`,
  `         const newDocRef = doc(collection(db, 'tests'));
         await setDoc(newDocRef, {
            ...testData,
            id: newDocRef.id,
            createdAt: new Date().toISOString()
         });`
);

fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code);
