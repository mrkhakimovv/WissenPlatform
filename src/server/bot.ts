import { Telegraf, Markup, session } from 'telegraf';
import { adminDb } from './notifications';

const BOT_TOKEN = process.env.BOT_TOKEN || '8799934388:AAFamw30dy3yQMzI8rSZCwOaxfHsxLq4TLA';
const ADMIN_ID = process.env.ADMIN_ID || '1986422890';

// Initialize Bot
export const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

const DOMAIN = process.env.APP_URL || process.env.WEB_APP_URL || 'https://ais-dev-ilqavbqhmw4a4t26oxwzro-188441935411.asia-southeast1.run.app';

// Handle /start
bot.start((ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.state = 'idle';
  
  ctx.reply(
    "Assalomu alaykum! Wissen Edu tizimining rasmiy botiga xush kelibsiz.\n\nTizimga kirish uchun quyidagi tugmani bosing.",
    Markup.inlineKeyboard([
      Markup.button.callback('Kirish', 'login_start')
    ])
  );
});

bot.action('login_start', (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.state = 'awaiting_username';
  ctx.reply("Foydalanuvchi nomini kiriting:");
});

bot.action('show_exams', async (ctx) => {
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

bot.on('text', async (ctx) => {
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
bot.launch().then(() => {
  console.log("Telegram Bot started!");
}).catch((err) => {
  console.error("Bot launch failed:", err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
