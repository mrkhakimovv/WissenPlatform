const fs = require('fs');
const content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const hookCode = `
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      const today = new Date();
      const dateStr = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
      
      const userRef = doc(db, 'users', user.id);
      updateDoc(userRef, {
        lastActive: new Date().toISOString(),
        [\`dailyUsage.\${dateStr}\`]: increment(1)
      }).catch(console.error);
    }, 60000); // every 1 minute
    
    return () => clearInterval(interval);
  }, [user?.id]);
`;

const updated = content.replace('  const login = async', hookCode + '\n  const login = async');
fs.writeFileSync('src/contexts/AuthContext.tsx', updated);
