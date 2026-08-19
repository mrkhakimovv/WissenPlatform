const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

// Inside handleAdd
code = code.replace(
  /const \{ password, \.\.\.dataToSave \} = formData;\s*await setDoc\(doc\(db, 'users', userCred\.user\.uid\), \{\s*\.\.\.dataToSave,/,
  `await setDoc(doc(db, 'users', userCred.user.uid), {
        ...formData,`
);

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
