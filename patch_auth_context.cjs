const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

const targetStr = `          } else {
            console.error('User doc not found in Firestore');
            setUser(null);
            setLoading(false);
          }`;

const replaceStr = `          } else {
            console.error('User doc not found in Firestore');
            signOut(auth);
            setUser(null);
            setLoading(false);
          }`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
