const fs = require('fs');
let code = fs.readFileSync('src/server/bot.ts', 'utf-8');

code = code.replace(
  "const DOMAIN = process.env.APP_URL || process.env.WEB_APP_URL || 'https://ais-dev-ilqavbqhmw4a4t26oxwzro-188441935411.asia-southeast1.run.app';",
  "// Quyidagi havolani o'zingizning render.com havolangiz bilan almashtiring (masalan: 'https://mening-loyiham.onrender.com')\nconst DOMAIN = process.env.APP_URL || process.env.WEB_APP_URL || 'https://wissen-edu-platform.onrender.com'; // <-- O'zingizning render dagi havolangizni shu yerga yozing"
);

fs.writeFileSync('src/server/bot.ts', code);
