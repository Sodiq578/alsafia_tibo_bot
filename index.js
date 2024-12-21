require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Secondary bot credentials
const secondaryBotToken = "7747931873:AAEx8TM-ddgYOQtnr6cyGGnT1nzC7ElG4u0";
const secondaryChatId = "5838205785";
const groupChatId = "-4644415048"; // Group chat ID

// User phone numbers and language preferences
const userPhones = new Map();
const userLanguages = new Map(); // Stores user language preferences

// Default language
const DEFAULT_LANGUAGE = 'uz';

const messages = {
  uz: {
    start: "\uD83D\uDC4B Salom, {{name}}! Telefon raqamingizni jo'natish uchun quyidagi tugmani bosing.",
    phoneSaved: "\u2705 Telefon raqamingiz tizimga muvaffaqiyatli qabul qilindi.",
    phoneAlreadySaved: "📱 Telefon raqamingiz allaqachon tizimga kiritilgan.",
    catalog: "Tovarlarimizni tanlang:",
    restart: "Qayta boshlash uchun /start ni bosing.",
    languageSelection: "Tilni tanlang:",
    uzbek: "O'zbek tili",
    english: "Ingliz tili",
    contactError: "Telefon raqamni qabul qilishda xatolik yuz berdi.",
  },
  en: {
    start: "\uD83D\uDC4B Hello, {{name}}! Please send your phone number by pressing the button below.",
    phoneSaved: "\u2705 Your phone number has been successfully registered in the system.",
    phoneAlreadySaved: "📱 Your phone number is already saved.",
    catalog: "Select a product:",
    restart: "Please type /start to restart.",
    languageSelection: "Select a language:",
    uzbek: "Uzbek",
    english: "English",
    contactError: "Error occurred while saving your phone number.",
  },
};

// Get message in user's preferred language
function getMessage(userId, key) {
  const language = userLanguages.get(userId) || DEFAULT_LANGUAGE;
  return messages[language][key];
}

// Handle `/start` command
bot.start((ctx) => {
  const userId = ctx.from.id;

  // Check if the phone number is already saved
  if (userPhones.has(userId)) {
    return showMainMenu(ctx);
  }

  // Send the initial message with the phone request
  ctx.reply(getMessage(userId, 'start').replace('{{name}}', ctx.from.first_name || 'User'), {
    reply_markup: {
      keyboard: [
        [
          {
            text: '📱 Telefon raqamni jo\'natish',
            request_contact: true,
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// Handle phone number submission
bot.on('contact', async (ctx) => {
  const userId = ctx.from.id;
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;

  // If phone number is not already saved
  if (!userPhones.has(userId)) {
    userPhones.set(userId, phoneNumber);

    const contactMessage = `📞 *Yangi kontakt*:\n*Ismi:* ${contact.first_name}\n*Telefon raqam:* ${phoneNumber}`;

    try {
      await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
        chat_id: secondaryChatId,
        text: contactMessage,
        parse_mode: 'Markdown',
      });

      ctx.reply(getMessage(userId, 'phoneSaved'));
    } catch (error) {
      console.error("❌ Xatolik yuz berdi:", error);
      return ctx.reply(getMessage(userId, 'contactError'));
    }

    bot.telegram.sendMessage(groupChatId, contactMessage, { parse_mode: 'Markdown' });
    showMainMenu(ctx);
  } else {
    ctx.reply(getMessage(userId, 'phoneAlreadySaved'));
    showMainMenu(ctx);
  }
});

// Show main menu
function showMainMenu(ctx) {
  const userId = ctx.from.id;
  ctx.reply(getMessage(userId, 'catalog'), {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📦 Tovarlarimiz', callback_data: 'catalog' },
        ],
        [
          { text: '🌐 Tilni o\'zgartirish', callback_data: 'change_language' },
        ],
        [
          { text: '🔄 Qayta boshlash', callback_data: 'home' },
        ],
        [
          { text: '🌐 Bizning saytimiz', url: 'https://example.com' },
        ],
      ],
    },
  });
}

// Handle callback queries
bot.on('callback_query', async (ctx) => {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data;

  if (data === 'catalog') {
    return ctx.reply("📦 Tovarlarimiz ro'yxatini hozirda ishlayapmiz.");
  } else if (data === 'change_language') {
    return ctx.reply(getMessage(userId, 'languageSelection'), {
      reply_markup: {
        inline_keyboard: [
          [
            { text: getMessage(userId, 'uzbek'), callback_data: 'lang_uz' },
            { text: getMessage(userId, 'english'), callback_data: 'lang_en' },
          ],
        ],
      },
    });
  } else if (data === 'home') {
    return ctx.reply(getMessage(userId, 'restart'));
  }
});

bot.on('callback_query', (ctx) => {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data;

  if (data === 'lang_uz') {
    userLanguages.set(userId, 'uz');
    ctx.reply("✅ Til o'zgartirildi: O'zbek tili");
  } else if (data === 'lang_en') {
    userLanguages.set(userId, 'en');
    ctx.reply("✅ Language changed: English");
  }
});

// Launch bot
bot.launch();
console.log('Bot ishga tushdi!');
