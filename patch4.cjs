const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const oldHook = `  useEffect(() => {
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
  }, [user?.id]);`;

const newHook = `  useEffect(() => {
    if (!user?.id) return;
    
    const updateUsage = () => {
      const today = new Date();
      const dateStr = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
      
      const userRef = doc(db, 'users', user.id);
      updateDoc(userRef, {
        lastActive: new Date().toISOString(),
        [\`dailyUsage.\${dateStr}\`]: increment(1)
      }).catch(console.error);
    };

    // Darhol yangilash (1 daqiqa kutib o'tirmaslik uchun)
    updateUsage();
    
    // Keyin har 60 soniyada yangilab turish
    const interval = setInterval(updateUsage, 60000);
    
    return () => clearInterval(interval);
  }, [user?.id]);`;

if (content.includes("const interval = setInterval(() => {")) {
    // We'll just replace everything between "useEffect(() => {" and "}, [user?.id]);" if it matches
    const startIdx = content.indexOf('  useEffect(() => {\n    if (!user?.id) return;');
    const endIdx = content.indexOf('  }, [user?.id]);', startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
        const toReplace = content.substring(startIdx, endIdx + '  }, [user?.id]);'.length);
        content = content.replace(toReplace, newHook);
        fs.writeFileSync('src/contexts/AuthContext.tsx', content);
        console.log("Replaced successfully");
    } else {
        console.log("Could not find boundaries");
    }
} else {
    console.log("Not found");
}
