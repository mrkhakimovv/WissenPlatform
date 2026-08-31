const fs = require('fs');
let code = fs.readFileSync('src/services/MathLiveConfig.ts', 'utf-8');

code = code.replace(
  /declare global \{\s*interface Window \{\s*mathVirtualKeyboard: any;\s*\}\s*\}/g,
  ""
);

code = code.replace(/window\.mathVirtualKeyboard/g, "(window as any).mathVirtualKeyboard");

fs.writeFileSync('src/services/MathLiveConfig.ts', code);
