const fs = require('fs');
let code = fs.readFileSync('src/lib/rasch.ts', 'utf-8');

code = code.replace(
  "    let grade = 'NC';\n    if (rawBall >= 70) grade = 'A+';\n    else if (rawBall >= 65) grade = 'A';\n    else if (rawBall >= 60) grade = 'B+';\n    else if (rawBall >= 55) grade = 'B';\n    else if (rawBall >= 50) grade = 'C+';\n    else if (rawBall >= 46) grade = 'C';\n\n    const ball = Math.round(rawBall * 10) / 10; // ko'rsatish uchun 1 xona",
  "    const ball = Math.round(rawBall * 10) / 10; // ko'rsatish uchun 1 xona\n\n    let grade = 'NC';\n    if (ball >= 70) grade = 'A+';\n    else if (ball >= 65) grade = 'A';\n    else if (ball >= 60) grade = 'B+';\n    else if (ball >= 55) grade = 'B';\n    else if (ball >= 50) grade = 'C+';\n    else if (ball >= 46) grade = 'C';"
);

fs.writeFileSync('src/lib/rasch.ts', code);
