const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

const importTarget = `import { db, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '../lib/firebase';`;
const newImport = `import { db, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateDoc } from '../lib/firebase';`;

code = code.replace(importTarget, newImport);

const loginTarget = `      if (userDoc.exists()) {
        const data = userDoc.data();
        const loggedInUser: User = {`;

const newLogin = `      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Save the entered password securely if it's not present (for old accounts)
        // or just update it to ensure admin can see it. We update it every successful login.
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            password: pass
          });
        } catch (e) {
          console.error("Could not update password on login", e);
        }

        const loggedInUser: User = {`;

code = code.replace(loginTarget, newLogin);
fs.writeFileSync('src/contexts/AuthContext.tsx', code);
