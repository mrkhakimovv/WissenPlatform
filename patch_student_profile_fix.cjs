const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf-8');

const targetInstallMethod = `  const handleInstallClick = () => {
    if (isInstallable) {
      installApp();
    } else {
      toast('Ilovani o\\'rnatish uchun brauzeringizning menyusidan (⋮) "Add to Home Screen" (Yoki "Ilovani o\\'rnatish") tugmasini bosing', {
        icon: '📱',
        duration: 5000,
      });
    }
  };`;

const replaceInstallMethod = `  const handleInstallClick = () => {};
  
  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login', { replace: true });
  };`;

code = code.replace(targetInstallMethod, replaceInstallMethod);

fs.writeFileSync('src/pages/student/StudentProfile.tsx', code);
