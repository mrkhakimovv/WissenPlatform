const fs = require('fs');
let code = fs.readFileSync('src/server/bot.ts', 'utf-8');
code = code.replace(
  "const BOT_TOKEN = process.env.BOT_TOKEN || '8799934388:AAFamw30dy3yQMzI8rSZCwOaxfHsxLq4TLA';",
  "const BOT_TOKEN = process.env.BOT_TOKEN;"
);
fs.writeFileSync('src/server/bot.ts', code);
