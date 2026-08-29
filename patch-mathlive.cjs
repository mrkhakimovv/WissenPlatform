const fs = require('fs');
let code = fs.readFileSync('src/services/MathLiveConfig.ts', 'utf-8');

code = code.replace("MathfieldElement.fontsDirectory = '/mathlive/fonts';", "// MathfieldElement.fontsDirectory = '/mathlive/fonts';");
code = code.replace("MathfieldElement.soundsDirectory = '/mathlive/sounds';", "// MathfieldElement.soundsDirectory = '/mathlive/sounds';");

fs.writeFileSync('src/services/MathLiveConfig.ts', code);
