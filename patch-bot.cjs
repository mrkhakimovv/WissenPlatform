const fs = require('fs');
let code = fs.readFileSync('src/server/bot.ts', 'utf-8');

const typeDefinitions = `
import { Context } from 'telegraf';

interface SessionData {
  state?: string;
  username?: string;
}

interface MyContext extends Context {
  session?: SessionData;
}
`;

code = code.replace("import { Telegraf, Markup, session } from 'telegraf';", "import { Telegraf, Markup, session } from 'telegraf';\n" + typeDefinitions);
code = code.replace("export const bot = new Telegraf(BOT_TOKEN);", "export const bot = new Telegraf<MyContext>(BOT_TOKEN);");

fs.writeFileSync('src/server/bot.ts', code);
