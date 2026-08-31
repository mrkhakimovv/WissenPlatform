const fs = require('fs');
let code = fs.readFileSync('src/server/bot.ts', 'utf-8');

const launchCode = `// Launch bot internally when imported
bot.launch().then(() => {
  console.log("Telegram Bot started!");
}).catch((err) => {
  console.error("Bot launch failed:", err);
});`;

const newLaunchCode = `// Launch bot internally when imported
let retries = 5;
const startBot = async () => {
  while (retries > 0) {
    try {
      await bot.launch();
      console.log("Telegram Bot started!");
      return;
    } catch (err: any) {
      if (err?.response?.error_code === 409) {
        console.warn(\`Bot launch 409 conflict. Retrying in 2s... (\${retries} retries left)\`);
        retries--;
        await new Promise(res => setTimeout(res, 2000));
      } else {
        console.error("Bot launch failed:", err);
        return;
      }
    }
  }
};
startBot();`;

code = code.replace(launchCode, newLaunchCode);
fs.writeFileSync('src/server/bot.ts', code);
