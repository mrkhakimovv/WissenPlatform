const fs = require('fs');
let code = fs.readFileSync('src/server/bot.ts', 'utf-8');

code = code.replace(
  "username?: string;",
  "username?: string;\n  password?: string;\n  userId?: string;"
);

fs.writeFileSync('src/server/bot.ts', code);
