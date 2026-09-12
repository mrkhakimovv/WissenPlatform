import { createRequire } from 'module';
const customRequire = typeof require !== 'undefined' ? require : createRequire(import.meta.url);
const TelegramBot = customRequire('node-telegram-bot-api');
console.log(typeof TelegramBot);
console.log(TelegramBot);
