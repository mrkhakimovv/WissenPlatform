const fs = require('fs');
let code = fs.readFileSync('src/lib/utils.ts', 'utf-8');

code = code.replace("return \\`\\${d}-\\${m}, \\${y} \\${hh}:\\${mm}\\`;", "return \\`\\${d}-\\${m}, \\${y}\\`;");

fs.writeFileSync('src/lib/utils.ts', code);
