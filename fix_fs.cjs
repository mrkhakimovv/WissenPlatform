const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');
code = code.replace(/if \(!document\.fullscreenElement\) \{\s*if \(containerRef\.current\) containerRef\.current\.requestFullscreen\(\)\.catch\(\(\)=>\{\}\);\s*else document\.documentElement\.requestFullscreen\(\)\.catch\(\(\)=>\{\}\);\s*\}\}/g, `if (!document.fullscreenElement) {
                    if (containerRef.current) containerRef.current.requestFullscreen().catch(()=>{});
                    else document.documentElement.requestFullscreen().catch(()=>{});
                  }`);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
