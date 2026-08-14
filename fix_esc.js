import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const oldEffect = `    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submitted) {
        setShowExitConfirm(true);
      }
    };

    if (hasStarted && !submitted) {
      document.addEventListener('copy', preventCopy);
      document.addEventListener('keydown', preventKeys);
      document.addEventListener('contextmenu', preventContext);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }
    
    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('keydown', preventKeys);
      document.removeEventListener('contextmenu', preventContext);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };`;

const newEffect = `    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submitted) {
        setShowExitConfirm(true);
      }
    };

    const handleKeys = (e: KeyboardEvent) => {
      preventKeys(e);
      if (e.key === 'Escape' && hasStarted && !submitted) {
        setShowExitConfirm(true);
      }
    };

    if (hasStarted && !submitted) {
      document.addEventListener('copy', preventCopy);
      document.addEventListener('keydown', handleKeys);
      document.addEventListener('contextmenu', preventContext);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }
    
    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('keydown', handleKeys);
      document.removeEventListener('contextmenu', preventContext);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };`;

code = code.replace(oldEffect, newEffect);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log("Updated");
