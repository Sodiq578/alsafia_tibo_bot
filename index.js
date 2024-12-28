require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Ikkinchi botning ma'lumotlari
const secondaryBotToken = "7906120070:AAH2LZ7KjhLydtdnhA6ROwkpAUtrOxmcSLY";
const secondaryChatId = "7609164487"; // Ikkinchi bot chat ID
const groupChatId = "-4644415048"; // Guruh chat ID

// Fayllar ro'yxati
const filesGroup = [
  ['./images/mijozfikri4.jpg', './images/mijozfikri5.jpg'],
  ['./images/mijozfikri6.jpg', 'images/mijozFikir8.jpg', './images/mijozfikri10.jpg'],
  ['./images/mijozfikri11.jpg', './images/rasimyangisi1.jpg', './images/mijozFikri13.jpg'],
];

let currentFeedbackIndex = 0; // Hozirgi fikrlar guruhi indeksi
const userPhones = new Map(); // Telefon raqamlarini saqlash
const userProductSelection = new Map(); // Foydalanuvchilar tanlagan mahsulotlar

// Mahsulotlar haqida ma'lumot
const products = {
  product_1: {
    title: "Qora Sedana",
    description:
      "💊 Qora sedana (Habba Sauda) qadimiy davolovchi o'simlik bo'lib, uning shifobaxsh xususiyatlari ko‘p asrlar davomida qadrlangan.\n\n✅ Foydalari:\n- Immunitetni kuchaytiradi\n- Yallig‘lanishni kamaytiradi\n- Oshqozon-ichak muammolarini bartaraf etishga yordam beradi\n📍 Qur'oni Karim va hadislarda shifobaxsh ekani aytilgan.\n\n📞 Bizda ishonchli va original mahsulot. Hozir buyurtma bering! 👇",
    phone: "+998555000205",
    image: "https://images.uzum.uz/cjpdakbk9fq13g44r3o0/original.jpg",
  },
  product_2: {
    title: "Kist ul hindi",
    description:
      "💊 Kist ul hindi o‘simlik asalari mahsulotlaridan biri bo‘lib, tabobatda qadimdan ishlatiladi.\n\n✅ Foydalari:\n- Nafas olish tizimini qo‘llab-quvvatlaydi\n- Oqsil hazm qilishni yaxshilaydi\n- Immunitetni mustahkamlaydi\n\n📞 Bizda ishonchli va original mahsulot. Hozir buyurtma bering! 👇",
    phone: "+998555000205",
    image: "https://frankfurt.apollo.olxcdn.com/v1/files/ltgpseprdwtu3-UZ/image",
  },
  product_3: {
    title: "Omega-3",
    description:
      "💊 Omega-3 yog‘ kislotalari yurak salomatligini yaxshilovchi va ko‘plab muhim jarayonlarda yordam beruvchi moddalardir.\n\n✅ Foydalari:\n- Yurakni mustahkamlaydi\n- Miya faoliyatini yaxshilaydi\n- Qon bosimini me'yorlashtiradi\n- Ko‘z salomatligini qo‘llab-quvvatlaydi\n\n📞 Bizda ishonchli va original mahsulot. Hozir buyurtma bering! 👇",
    phone: "+998555000205",
    image: "https://images.uzum.uz/cgmmp7ng49devoacolb0/original.jpg",
  },
};

// Asosiy menyu tugmalari
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📦 Qora Sedana', callback_data: 'product_1' },
        { text: '📦 Kist ul hindi', callback_data: 'product_2' },
      ],
      [
        { text: '📦 Omega 3', callback_data: 'product_3' },
        { text: '📦 Mijozlar fikri', callback_data: 'feedback_start' },
      ],
      [
        { text: "🌐 Bizning saytimizga o'tish", url: 'https://alsafiya.vercel.app/home' },
      ],
      [
        { text: '🔄 Botni qayta ishga tushirish', callback_data: 'restart_bot' }
      ]
    ],
  };
}

// /start buyrug'ini qayta ishlash
bot.start((ctx) => {
  const userId = ctx.from.id;

  if (!userPhones.has(userId)) {
    ctx.reply(
      `👋 Salom, ${ctx.from.first_name || 'Foydalanuvchi'}! Telefon raqamingizni jo'natish uchun quyidagi tugmani bosing.`,
      {
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
      }
    );
  } else {
    ctx.reply('Asosiy menyuga xush kelibsiz!', { reply_markup: getMainMenuKeyboard() });
  }
});

// Telefon raqamini qabul qilish
bot.on('contact', async (ctx) => {
  const userId = ctx.from.id;
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;

  if (!userPhones.has(userId)) {
    userPhones.set(userId, phoneNumber);


    const contactMessage = `📞 *Yangi kontakt*:\n*Ismi:* ${contact.first_name}\n*Telefon raqam:* ${phoneNumber}`;

    try {
      await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
        chat_id: secondaryChatId,
        text: contactMessage,
        parse_mode: 'Markdown',
      });
      ctx.reply("✅ Telefon raqamingiz tizimga muvaffaqiyatli qabul qilindi.");
    } catch (error) {
      console.error("❌ Xatolik yuz berdi:", error);
      ctx.reply("❌ Telefon raqamni yuborishda xatolik yuz berdi.");
    }

    bot.telegram.sendMessage(groupChatId, contactMessage, { parse_mode: 'Markdown' });
    ctx.reply('Asosiy menyuga xush kelibsiz!', { reply_markup: getMainMenuKeyboard() });
  } else {
    ctx.reply("✅ Telefon raqamingiz allaqachon saqlangan.");
  }
});

// Mahsulot tanlash va foydalanuvchining tanlovi haqida xabar yuborish
bot.on('callback_query', async (ctx) => {
  const action = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  if (products[action]) {
    const product = products[action];

    // Foydalanuvchining tanlagan mahsulotini saqlash
    userProductSelection.set(userId, product.title);

    // Mahsulotni va foydalanuvchi ID raqamini ko'rsatish
    const productMessage = `Foydalanuvchi ${ctx.from.first_name} (${userId}) mahsulotni tanladi: ${product.title}`;

    // Tanlangan mahsulot haqida xabar yuborish
    try {
      await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
        chat_id: secondaryChatId,
        text: productMessage,
        parse_mode: 'Markdown',
      });

      // Yuborilgan mahsulotning rasmi bilan birga xabar yuborish
      await ctx.replyWithPhoto(product.image, {
        caption: `Siz tanlagan mahsulot: ${product.title}\n\n${product.description}\n\n📞 Xoziroq sotib olish uchun qo'ng'iroq qiling: [${product.phone}](tel:${product.phone})`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Asosiy menyuga qaytish', callback_data: 'back_to_menu' }],
            [{ text: "🌐 Bizning saytimizga o'tish", url: 'https://alsafiya.vercel.app/home' }],
            [{ text: '🔄 Botni qayta ishga tushirish', callback_data: 'restart_bot' }]
          ],
        },
      });
    } catch (error) {
      console.error("❌ Xatolik yuz berdi:", error);
      ctx.reply("❌ Mahsulotni yuborishda xatolik yuz berdi.");
    }
  } else if (action === 'feedback_start') {
    currentFeedbackIndex = 0;
    await showFeedback(ctx);
  } else if (action === 'feedback_next') {
    if (currentFeedbackIndex < filesGroup.length - 1) {
      currentFeedbackIndex++;
      await showFeedback(ctx);
    } else {
      ctx.reply( "Hozircha boshqa fikrlar botga qo'shilmagan. Qo'shimcha ma'lumotlar kerak bo'lsa, bizga qo'ng'iroq qiling 😊 55 500 02 05.", {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Asosiy menyuga qaytish', callback_data: 'back_to_menu' }],
            [{ text: "🌐 Bizning saytimizga o'tish", url: 'https://alsafiya.vercel.app/home' }],
          ],
        },
      });
    }
  } else if (action === 'back_to_menu') {
    ctx.reply('Asosiy menyuga qaytdingiz.', { reply_markup: getMainMenuKeyboard() });
  } else if (action === 'restart_bot') {
    ctx.reply("Botni qayta ishga tushirish uchun /start buyurigini bosing", { reply_markup: { inline_keyboard: [] } });
    bot.stop('SIGINT');
    bot.launch();
  }
});

// Global o'zgaruvchi uchun oldingi fikrlarni saqlash
let feedbackHistory = [];  // Bu arrayda foydalanuvchi ko'rgan fikrlar saqlanadi

// Mahsulotlar va fikrlar haqida xabar yuborish
async function showFeedback(ctx) {
  const currentFiles = filesGroup[currentFeedbackIndex];

  if (currentFiles && currentFiles.length > 0) {
    try {
      // O'tgan fikrlarni o'chirish
      for (let message of feedbackHistory) {
        try {
          await ctx.deleteMessage(message.message_id);
        } catch (error) {
          console.error("Xabarni o'chirishda xatolik:", error);
        }
      }
    } catch (error) {
      console.error("Xabarlarni o'chirishda xatolik:", error);
    }


    // Yangi fikrlarni yuborish
    const sentMessages = [];
    for (const file of currentFiles) {
      try {
        const sentMessage = await ctx.replyWithPhoto({ source: file },  );
        sentMessages.push(sentMessage);
      } catch (error) {
        console.error('Fayl yuborishda xatolik:', error);
      }
    }

    // Yangi fikrlarni saqlash
    feedbackHistory = sentMessages;

    ctx.reply('Quyidagi tugmalardan birini tanlang:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Yana fikrlar', callback_data: 'feedback_next' }],
          [{ text: '🔙 Asosiy menyuga qaytish', callback_data: 'back_to_menu' }],
          [{ text: "🌐 Bizning saytimizga o'tish", url: 'https://alsafiya.vercel.app/home' }],
        ],
      },
    });
  } else {
    ctx.reply(
      "Hozircha boshqa fikrlar botga qo'shilmagan. Qo'shimcha ma'lumotlar kerak bo'lsa, bizga qo'ng'iroq qiling 😊 55 500 02 05.",
      { reply_markup: getMainMenuKeyboard() }
    );
    
  }
}

// Botni ishga tushirish
bot.launch();
console.log("Srdtfyg");
