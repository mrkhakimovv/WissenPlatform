const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

// Fix the onSnapshot one
code = code.replace(
  `const data = userDoc.data();
        if (data.status === 'archived') {
          await signOut(auth);
          throw new Error("Ushbu akkaunt arxivlangan. Arxivdan chiqarish uchun adminga murojaat qiling.");
        }`,
  `const data = userDoc.data();
            if (data.status === 'archived') {
              signOut(auth).catch(console.error);
              setUser(null);
              setLoading(false);
              return;
            }`
);

// Add the check in the login function
const loginCheckTarget = `const data = userDoc.data();
        
        // Save the entered password`;
code = code.replace(
  loginCheckTarget,
  `const data = userDoc.data();
        if (data.status === 'archived') {
          await signOut(auth);
          throw new Error("Ushbu akkaunt arxivlangan. Arxivdan chiqarish uchun adminga murojaat qiling.");
        }
        
        // Save the entered password`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
