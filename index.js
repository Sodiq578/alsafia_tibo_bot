require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs'); // Local rasmlar bilan ishlash uchun kerak

const bot = new Telegraf(process.env.BOT_TOKEN);

// Ikkinchi botning ma'lumotlari
const secondaryBotToken = "7906120070:AAH2LZ7KjhLydtdnhA6ROwkpAUtrOxmcSLY";
const secondaryChatId = "7609164487"; // Ikkinchi bot chat ID
const groupChatId = "-4644415048"; // Guruh chat ID (yangilangan)

// Rasmlar va audio fayllar ro'yxati
const files = [
  './images/mijozfikri4.jpg',
  './images/mijozfikri5.jpg',
  './images/mijozfikri6.jpg',
  './images/mijozfikri8.jpg',
  './images/mijozfikri10.jpg',
  './images/mijozfikri11.jpg',
  './images/mijozFikri12.jpg',
  './images/mijozFikri13.jpg',
  './images/mijozFirki.jpg',
  './images/mijozFirki7.jpg',
  './images/mijozfikriGolos2.ogg', // Audio fayl
  './images/mijozFirki12.ogg' // Audio fayl
];

// Foydalanuvchi telefon raqamini saqlash uchun (xotira)
const userPhones = new Map();

// /start buyrug'ini qayta ishlash
bot.start((ctx) => {
  const userId = ctx.from.id;

  if (!userPhones.has(userId)) {
    // Telefon raqami yo'q bo'lsa
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
    // Telefon raqami allaqachon saqlangan bo'lsa
    showCatalog(ctx);
  }
});

// Telefon raqamini qabul qilish va boshqa botga yuborish
bot.on('contact', async (ctx) => {
  const userId = ctx.from.id;
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name || 'Foydalanuvchi';

  if (!userPhones.has(userId)) {
    // Telefon raqamini saqlash
    userPhones.set(userId, phoneNumber);

    const contactMessage = `📞 *Yangi kontakt*:\n*Ismi:* ${firstName}\n*Telefon raqam:* ${phoneNumber}`;
    
    // Raqamni boshqa botga yuborish
    try {
      await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
        chat_id: secondaryChatId,
        text: contactMessage,
        parse_mode: 'Markdown',
      });
      ctx.reply("✅ Telefon raqamingiz tizimga muvaffaqiyatli qabul qilindi.");
    } catch (error) {
      console.error("❌ Xatolik yuz berdi:", error);
      ctx.reply("❌ Telefon raqam tizimga yuborishda xatolik yuz berdi.");
    }

    // Guruhga yuborish
    bot.telegram.sendMessage(groupChatId, contactMessage, { parse_mode: 'Markdown' });

    // Katalogni ko'rsatish
    showCatalog(ctx);
  } else {
    ctx.reply("✅ Telefon raqamingiz allaqachon saqlangan.");
    showCatalog(ctx);
  }
});

// Katalogni ko'rsatish
function showCatalog(ctx) {
  ctx.reply('Mahsulotlarimizni tanlang yoki "Qayta boshlash" tugmasidan foydalaning:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📦 Qora Sedana', callback_data: 'product_1' },
          { text: '📦 Kist ul hindi', callback_data: 'product_2' },
        ],
        [
          { text: '📦 Omega 3', callback_data: 'product_3' },
          { text: '📦 Mijozlar fikri', callback_data: 'product_5' },
        ],
        [
          { text: '🌐 Bizning saytimiz', url: 'https://alsafiya.vercel.app/home' }, // Sayt tugmasi
        ],
        [
          { text: '🔄 Botni qayta ishga tushirish', callback_data: 'restart' },
        ],
        [
          { text: '📞 Xoziroq qoniroq qilish', callback_data: 'product_6' },
        ],
      ],
    },
  });
}

// Mahsulotni tanlash
bot.on('callback_query', async (ctx) => {
  const product = ctx.callbackQuery.data;
  console.log("Mahsulot tanlandi:", product);  // Debug: Mahsulotni tekshirib chiqing
  
  let productDetails = '';
  let productImage = '';
  try {
    if (product === 'product_1') {
      productDetails =
        `Mahsulot 1: Qora sedana yog'i\n` +
        `💊 Qora sedana (Habba Sauda) qadimiy davolovchi o'simlik bo'lib, uning shifobaxsh xususiyatlari ko‘p asrlar davomida qadrlangan.\n\n` +
        `✅ Foydalari:\n` +
        `- Immunitetni kuchaytiradi\n` +
        `- Yallig‘lanishni kamaytiradi\n` +
        `- Oshqozon-ichak muammolarini bartaraf etishga yordam beradi\n` +
        `📍 Qur'oni Karim va hadislarda shifobaxsh ekani aytilgan.\n\n` +
        `📞 Bizda ishonchli va original mahsulot. Hozir buyurtma bering! ` +
        `[Qo'ng'iroq qilish uchun bosish](tel:+998555000205)`;
      productImage = 'https://images.uzum.uz/cjpdakbk9fq13g44r3o0/original.jpg';
    } else if (product === 'product_2') {
      productDetails =
        `Mahsulot 2: Kist ul hindi\n` +
        `💊 Kist ul hindi o‘simlik asalari mahsulotlaridan biri bo‘lib, tabobatda qadimdan ishlatiladi.\n\n` +
        `✅ Foydalari:\n` +
        `- Nafas olish tizimini qo‘llab-quvvatlaydi\n` +
        `- Oqsil hazm qilishni yaxshilaydi\n` +
        `- Immunitetni mustahkamlaydi\n\n` +
        `📞 Bizda ishonchli va original mahsulot. Hozir buyurtma bering! ` +
        `[Qo'ng'iroq qilish uchun bosish](tel:+998555000205)`;
      productImage = 'https://frankfurt.apollo.olxcdn.com/v1/files/ltgpseprdwtu3-UZ/image';
    } else if (product === 'product_3') {
      productDetails =
        `Mahsulot 3: Omega-3 kapsulalari\n` +
        `💊 Omega-3 yog‘ kislotalari yurak salomatligini yaxshilovchi va ko‘plab muhim jarayonlarda yordam beruvchi moddalardir.\n\n` +
        `✅ Foydalari:\n` +
        `- Yurakni mustahkamlaydi\n` +
        `- Miya faoliyatini yaxshilaydi\n` +
        `- Qon bosimini me'yorlashtiradi\n` +
        `- Ko‘z salomatligini qo‘llab-quvvatlaydi\n\n` +
        `📞 Bizda ishonchli va original mahsulot. Hozir buyurtma bering! ` +
        `[Qo'ng'iroq qilish uchun bosish](tel:+998555000205)`;
      productImage = 'https://images.uzum.uz/cgmmp7ng49devoacolb0/original.jpg';
    } else if (product === 'product_5') {
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            if (file.endsWith('.ogg')) {
              // Agar fayl audio bo'lsa
              await ctx.replyWithAudio({ source: file }, { caption: "Mijozlar fikri:" });
            } else {
              // Agar fayl rasm bo'lsa
              await ctx.replyWithPhoto({ source: file }, { caption: "Mijozlar fikri:" });
            }
          } catch (error) {
            console.error("❌ Fayl yuborishda xatolik:", error);
          }
        }
      } else {
        await ctx.reply("Hozircha mijozlar fikrlari mavjud emas.");
      }
    } else if (product === 'product_6') {
      productDetails = `📞 +998 (55) 500-02-05`;
      productImage = 'https://cdn-icons-png.flaticon.com/512/3192/3192940.png'; // Telefon tasviri
    }

    await ctx.replyWithPhoto(productImage, { caption: productDetails });
  } catch (error) {
    console.error("❌ Xatolik yuz berdi:", error);
    ctx.reply("❌ Xatolik yuz berdi, iltimos, keyinroq qayta urinib ko'ring.");
  }

  try {
    await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
      chat_id: secondaryChatId,
      text: `Mahsulot tanlandi:\n\n${productDetails}`,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error("❌ Xatolik yuz berdi:", error);
  }
});

// Xabarni boshqa botga yuborish
bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const day = now.getDate();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  const weekday = now.toLocaleString('default', { weekday: 'long' });
  const formattedDate = `${hours}:${minutes} ${weekday} ${day}-${month}, ${year} yil`;

  try {
    await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
      chat_id: secondaryChatId,
      text: `📩 Xabar: ${message}\n🕒 Vaqt: ${formattedDate}`,
    });
  } catch (error) {
    console.error("❌ Xatolik yuz berdi:", error);
  }
});

// Botni ishga tushirish
bot.launch();
console.log('Bot ishga tushdi!');
