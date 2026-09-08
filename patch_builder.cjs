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

code = code.replace(
  `         await setDoc(newDocRef, {
            ...testData,
            id: newDocRef.id,
            createdAt: new Date().toISOString()
         });
         toast.success("Test saqlandi!");
      }
      onSave();`,
  `         const savedData = {
            ...testData,
            id: newDocRef.id,
            createdAt: new Date().toISOString()
         };
         await setDoc(newDocRef, savedData);
         toast.success("Test saqlandi!");
         onSave(savedData);
      } else {
         onSave(testData);
      }`
);

// Wait, I need to make sure the if branch also calls onSave(testData).
// The original code was:
/*
      if (testData.id) {
         await updateDoc(doc(db, 'tests', testData.id), {
            ...testData
         });
         toast.loading("Natijalar qayta hisoblanmoqda...", { id: 'recalc' });
         await recalculateStandardExams(testData);
         toast.success("Test saqlandi va mos imtihon natijalari yangilandi!", { id: 'recalc' });
      } else {
         ...
      }
      onSave();
*/

// It's better to just replace `onSave();` with `onSave(testData);` but for new test, `testData.id` is empty. Let me just use regex.
