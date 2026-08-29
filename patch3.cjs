const fs = require('fs');
let code = fs.readFileSync('src/lib/rasch.ts', 'utf-8');

code = code.replace(
  "const ball = rawBall;",
  "const ball = Math.floor(rawBall * 10) / 10; // ballar yaxlitlanmasligi uchun floor (masalan 45.96 => 45.9)"
);

fs.writeFileSync('src/lib/rasch.ts', code);
