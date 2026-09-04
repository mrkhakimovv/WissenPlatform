import { Telegraf, Markup, session } from 'telegraf';

import { Context } from 'telegraf';

interface SessionData {
  state?: string;
  username?: string;
  password?: string;
  userId?: string;
}

interface MyContext extends Context {
  session?: SessionData;
}

import { adminDb } from './notifications';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID || '1986422890';

// Initialize Bot
export const bot = BOT_TOKEN ? new Telegraf<MyContext>(BOT_TOKEN) : null as any;
if (bot) bot.use(session());

// Quyidagi havolani o'zingizning render.com havolangiz bilan almashtiring (masalan: 'https://mening-loyiham.onrender.com')
const DOMAIN = process.env.APP_URL || process.env.WEB_APP_URL || 'https://wissenedu.onrender.com'; // <-- O'zingizning render dagi havolangizni shu yerga yozing

// Handle /start
if (bot) bot.start((ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.state = 'idle';
  
  ctx.reply(
    "Assalomu alaykum! Wissen Edu tizimining rasmiy botiga xush kelibsiz.\n\nTizimga kirish uchun quyidagi tugmani bosing.",
    Markup.inlineKeyboard([
      Markup.button.callback('Kirish', 'login_start')
    ])
  );
});

if (bot) bot.action('login_start', (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.state = 'awaiting_username';
  ctx.reply("Foydalanuvchi nomini kiriting:");
});

if (bot) bot.action('show_exams', async (ctx) => {
  if (!adminDb) {
    return ctx.reply("Tizimda xatolik (DB).");
  }
  
  try {
    const examsSnap = await adminDb.collection('exams')
      .where('examType', '==', 'certificate')
      .where('status', '==', 'active')
      .get();
      
    if (examsSnap.empty) {
      return ctx.reply("Hozirda faol milliy sertifikat imtihonlari yo'q.");
    }
    
    const buttons = [];
    examsSnap.forEach(doc => {
      const data = doc.data();
      buttons.push([Markup.button.webApp(data.title || "Imtihon", `${DOMAIN}/tg-exam?examId=${doc.id}`)]);
    });
    
    ctx.reply("Mavjud Milliy Sertifikat imtihonlari:", Markup.inlineKeyboard(buttons));
  } catch (error) {
    console.error("Exams fetch error", error);
    ctx.reply("Imtihonlarni yuklashda xatolik.");
  }
});

if (bot) bot.on('text', async (ctx) => {
  ctx.session = ctx.session || {};
  const text = ctx.message.text.trim();
  
  if (ctx.session.state === 'awaiting_username') {
    ctx.session.username = text;
    ctx.session.state = 'awaiting_password';
    ctx.reply("Parolni kiriting:");
  } 
  else if (ctx.session.state === 'awaiting_password') {
    ctx.session.password = text;
    const username = ctx.session.username;
    const password = ctx.session.password;
    ctx.session.state = 'idle';
    
    // Authenticate
    if (!adminDb) {
      return ctx.reply("Tizimda xatolik yuz berdi (Baza ulanmagan).");
    }
    
    try {
      const usersSnap = await adminDb.collection('users')
        .where('username', '==', username)
        .where('password', '==', password)
        .get();
        
      const emailQuery = await adminDb.collection('users')
        .where('email', '==', `${username}@wissen.internal`)
        .where('password', '==', password)
        .get();
        
      const validDoc = !usersSnap.empty ? usersSnap.docs[0] : (!emailQuery.empty ? emailQuery.docs[0] : null);
      
      if (validDoc) {
        // Save telegram chat ID to user document
        await adminDb.collection('users').doc(validDoc.id).update({
          telegramChatId: ctx.chat.id
        });
        
        ctx.session.userId = validDoc.id;
        ctx.reply(
          `Muvaffaqiyatli kirdingiz, ${validDoc.data().fullName || validDoc.data().username}!\n\nImtihonlarni ko'rish uchun "Milliy sertifikat" tugmasini bosing.`,
          Markup.inlineKeyboard([
            Markup.button.callback('Milliy sertifikat', 'show_exams')
          ])
        );
      } else {
        ctx.reply("Foydalanuvchi nomi yoki parol noto'g'ri. Qaytadan /start bosib urinib ko'ring.");
      }
    } catch (error) {
      console.error(error);
      ctx.reply("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    }
  } else {
    // If authenticated, maybe just show a menu
    if (ctx.session.userId) {
      ctx.reply(
        "Asosiy menyu:",
        Markup.inlineKeyboard([
          Markup.button.callback('Milliy sertifikat', 'show_exams')
        ])
      );
    } else {
      ctx.reply("Iltimos, tizimga kirish uchun /start ni bosing.");
    }
  }
});

// Launch bot internally when imported
let retries = 5;
const startBot = async () => {
  if (!bot) { console.warn('No BOT_TOKEN provided, skipping telegram bot setup'); return; }
  while (retries > 0) {
    try {
      await bot.launch();
      console.log("Telegram Bot started!");
      return;
    } catch (err: any) {
      if (err?.response?.error_code === 409) {
        console.warn(`Bot launch 409 conflict. Retrying in 2s... (${retries} retries left)`);
        retries--;
        await new Promise(res => setTimeout(res, 2000));
      } else {
        console.error("Bot launch failed:", err);
        return;
      }
    }
  }
};
startBot();

// Enable graceful stop
process.once('SIGINT', () => bot && bot.stop('SIGINT'));
process.once('SIGTERM', () => bot && bot.stop('SIGTERM'));
