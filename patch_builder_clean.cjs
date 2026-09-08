const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');

code = code.replace(
  `interface Props {
  initialData: TestData;
  onClose: () => void;
  onSave: () => void;
}`,
  `interface Props {
  initialData: TestData;
  onClose: () => void;
  onSave: (savedTest?: TestData) => void;
}`
);

const oldSave = `      if (testData.id) {
         await updateDoc(doc(db, 'tests', testData.id), {
            ...testData
         });
         toast.loading("Natijalar qayta hisoblanmoqda...", { id: 'recalc' });
         await recalculateStandardExams(testData);
         toast.success("Test saqlandi va mos imtihon natijalari yangilandi!", { id: 'recalc' });
      } else {
         const newDocRef = doc(collection(db, 'tests'));
         await setDoc(newDocRef, {
            ...testData,
            id: newDocRef.id,
            createdAt: new Date().toISOString()
         });
         toast.success("Test saqlandi!");
      }
      onSave();`;

const newSave = `      let finalData = { ...testData };
      if (testData.id) {
         await updateDoc(doc(db, 'tests', testData.id), {
            ...testData
         });
         toast.loading("Natijalar qayta hisoblanmoqda...", { id: 'recalc' });
         await recalculateStandardExams(testData);
         toast.success("Test saqlandi va mos imtihon natijalari yangilandi!", { id: 'recalc' });
      } else {
         const newDocRef = doc(collection(db, 'tests'));
         finalData = {
            ...testData,
            id: newDocRef.id,
            createdAt: new Date().toISOString()
         };
         await setDoc(newDocRef, finalData);
         toast.success("Test saqlandi!");
      }
      onSave(finalData);`;

code = code.replace(oldSave, newSave);
fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code);
