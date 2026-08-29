const fs = require('fs');
let code = fs.readFileSync('src/server/bot.ts', 'utf-8');
code = code.replace(/const DOMAIN = process.env.WEB_APP_URL || 'https:\/\/ais-pre-.*?';/g, "const DOMAIN = process.env.APP_URL || process.env.WEB_APP_URL || 'https://ais-dev-ilqavbqhmw4a4t26oxwzro-188441935411.asia-southeast1.run.app';");
fs.writeFileSync('src/server/bot.ts', code);
