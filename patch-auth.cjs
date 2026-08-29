const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

code = code.replace(`        }, (err) => {
          console.error('Error fetching user:', err);
          toast.error("Tizimga kirishda xatolik (Ruxsat yo'q). Firebase qoidalarini tekshiring.");
          signOut(auth);
          setUser(null);
          setLoading(false);
        });`, `        }, (err) => {
          console.error('Error fetching user:', err);
          if (err.message && err.message.toLowerCase().includes('offline')) {
            console.warn('Client is offline. Keeping current auth state.');
            setLoading(false);
          } else {
            toast.error("Tizimga kirishda xatolik (Ruxsat yo'q). Firebase qoidalarini tekshiring.");
            signOut(auth);
            setUser(null);
            setLoading(false);
          }
        });`);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
