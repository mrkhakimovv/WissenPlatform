const fs = require('fs');
let code = fs.readFileSync('src/server/bot.ts', 'utf-8');

code = code.replace(
  "export const bot = new Telegraf<MyContext>(BOT_TOKEN);",
  "export const bot = BOT_TOKEN ? new Telegraf<MyContext>(BOT_TOKEN) : null as any;"
);
code = code.replace(
  "bot.use(session());",
  "if (bot) bot.use(session());"
);

code = code.replace(
  "bot.start((ctx) => {",
  "if (bot) bot.start((ctx) => {"
);
code = code.replace(
  "bot.action('login_start', (ctx) => {",
  "if (bot) bot.action('login_start', (ctx) => {"
);
code = code.replace(
  "bot.action('show_exams', async (ctx) => {",
  "if (bot) bot.action('show_exams', async (ctx) => {"
);
code = code.replace(
  "bot.on('text', async (ctx) => {",
  "if (bot) bot.on('text', async (ctx) => {"
);

code = code.replace(
  "const startBot = async () => {",
  "const startBot = async () => {\n  if (!bot) { console.warn('No BOT_TOKEN provided, skipping telegram bot setup'); return; }"
);

code = code.replace(
  "process.once('SIGINT', () => bot.stop('SIGINT'));\nprocess.once('SIGTERM', () => bot.stop('SIGTERM'));",
  "process.once('SIGINT', () => bot && bot.stop('SIGINT'));\nprocess.once('SIGTERM', () => bot && bot.stop('SIGTERM'));"
);

fs.writeFileSync('src/server/bot.ts', code);
