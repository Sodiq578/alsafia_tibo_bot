require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Ikkinchi bot tokeni
const secondaryBotToken = "7747931873:AAEx8TM-ddgYOQtnr6cyGGnT1nzC7ElG4u0";
const secondaryChatId = "5838205785";
const groupChatId = "-4644415048"; // Guruh chat ID

// Foydalanuvchi telefon raqami saqlash uchun (xotira)
const userPhones = new Map();

// Tilni saqlash (default: uz)
const userLanguages = new Map();

// Tilni o'zgartirish
const LANGUAGES = {
  uz: {
    startMessage: "👋 Salom, {name}! Telefon raqamingizni jo'natish uchun quyidagi tugmani bosing.",
    phoneRequest: "📱 Telefon raqamni jo'natish",
    phoneReceived: "✅ Telefon raqamingiz tizimga muvaffaqiyatli qabul qilindi.",
    mainMenu: "Quyidagi tugmalardan birini tanlang:",
    catalog: "Tovarlarimiz",
    changeLanguage: "tilni o'zgartiris",
    website: "Bizning saytimiz",
    restart: "Qayta boshlash",
    productDetails: "Mahsulot haqida ma'lumot",
    productMessage: "Mahsulot 1: Qora sedana yog'i\n💰 Narxi: 150,000 so'm\n✅ Foydalari:\n- Immunitetni oshiradi\n- Terini va sochlarni mustahkamlaydi",
  },
  ru: {
    startMessage: "👋 Привет, {name}! Нажмите кнопку ниже, чтобы отправить ваш номер телефона.",
    phoneRequest: "📱 Отправить номер телефона",
    phoneReceived: "✅ Ваш номер телефона успешно принят в систему.",
    mainMenu: "Выберите одну из кнопок:",
    catalog: "Наши товары",
    changeLanguage: "Сменить язык",
    website: "Наш сайт",
    restart: "Перезапустить",
    productDetails: "Информация о товаре",
    productMessage: "Товар 1: Черный седана масло\n💰 Цена: 150,000 сум\n✅ Польза:\n- Укрепляет иммунитет\n- Укрепляет кожу и волосы",
  },
  en: {
    startMessage: "👋 Hello, {name}! Click the button below to send your phone number.",
    phoneRequest: "📱 Send phone number",
    phoneReceived: "✅ Your phone number has been successfully accepted.",
    mainMenu: "Choose one of the options:",
    catalog: "Our Products",
    changeLanguage: "Change Language",
    website: "Our Website",
    restart: "Restart",
    productDetails: "Product Information",
    productMessage: "Product 1: Black Sedana Oil\n💰 Price: 150,000 som\n✅ Benefits:\n- Boosts immunity\n- Strengthens skin and hair",
  }
};

// /start komandasini boshqarish
bot.start((ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.first_name || "Foydalanuvchi"; // Ismi bo'lmasa, "Foydalanuvchi" deb belgilaymiz
  const language = userLanguages.get(userId) || 'uz'; // Standart til - uzbekcha

  if (!userPhones.has(userId)) {
    // Agar telefon raqami hali saqlanmagan bo'lsa
    ctx.reply(
      LANGUAGES[language].startMessage.replace("{name}", userName),
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: LANGUAGES[language].phoneRequest,
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
    // Telefon raqami allaqachon mavjud bo'lsa
    showMainMenu(ctx, language);
  }
});

// Telefon raqamini qabul qilish va boshqa botga yuborish
bot.on('contact', async (ctx) => {
  const userId = ctx.from.id;
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name || 'Foydalanuvchi';

  const language = userLanguages.get(userId) || 'uz'; // Standart til - uzbekcha

  if (!userPhones.has(userId)) {
    // Telefon raqamini saqlash
    userPhones.set(userId, phoneNumber);

    // Raqamni boshqa botga yuborish
    try {
      await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
        chat_id: secondaryChatId,
        text: `📞 *Yangi kontakt*:\n*Ismi:* ${firstName}\n*Telefon raqam:* ${phoneNumber}`,
        parse_mode: 'Markdown',
      });
      ctx.reply(LANGUAGES[language].phoneReceived);
    } catch (error) {
      console.error("❌ Xatolik yuz berdi:", error);
      ctx.reply("❌ Telefon raqam tizimga yuborishda xatolik yuz berdi.");
    }

    // Guruhga yuborish
    bot.telegram.sendMessage(groupChatId, `📞 *Yangi kontakt*:\n*Ismi:* ${firstName}\n*Telefon raqam:* ${phoneNumber}`, { parse_mode: 'Markdown' });

    // Asosiy menyuni ko'rsatish
    showMainMenu(ctx, language);
  } else {
    ctx.reply("✅ Telefon raqamingiz allaqachon saqlangan.");
    showMainMenu(ctx, language);
  }
});

// Asosiy menyu (telefon raqami saqlangandan keyin)
function showMainMenu(ctx, language) {
  ctx.reply(LANGUAGES[language].mainMenu, {
    reply_markup: {
      keyboard: [
        [
          { text: LANGUAGES[language].catalog, callback_data: 'catalog' },
          { text: LANGUAGES[language].changeLanguage, callback_data: 'change_language' },
        ],
        [
          { text: LANGUAGES[language].website, callback_data: 'website' },
          { text: LANGUAGES[language].restart, callback_data: 'home' },
        ],
      ],
      resize_keyboard: true,
    },
  });
}

// Mahsulotlarni ko'rsatish
function showCatalog(ctx, language) {
  ctx.reply(LANGUAGES[language].productDetails, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: LANGUAGES[language].productMessage, callback_data: 'product_1' },
        ],
        [
          { text: "Mahsulot 2", callback_data: 'product_2' },
        ],
        [
          { text: "Mahsulot 3", callback_data: 'product_3' },
        ],
        [
          { text: "Mahsulot 4", callback_data: 'product_4' },
        ],
        [
          { text: "Mahsulot 5", callback_data: 'product_5' },
        ],
        [
          { text: LANGUAGES[language].restart, callback_data: 'restart' },
        ],
      ],
    },
  });
}

// Mahsulotni tanlash
bot.on('callback_query', async (ctx) => {
  const product = ctx.callbackQuery.data;
  const language = userLanguages.get(ctx.from.id) || 'uz'; // Standart til - uzbekcha
  let productDetails, productImage;

  if (product === 'product_1') {
    productDetails = `Mahsulot 1: Qora sedana yog'i\n💰 Narxi: 150,000 so'm\n✅ Foydalari:\n- Immunitetni oshiradi\n- Terini va sochlarni mustahkamlaydi`;
    productImage = 'https://images.uzum.uz/cjpdakbk9fq13g44r3o0/original.jpg';
  } else if (product === 'product_2') {
    productDetails = `Mahsulot 2: Omega-3 kapsulalari\n💰 Narxi: 200,000 so'm\n✅ Foydalari:\n- Miya faoliyatini yaxshilaydi\n- Yurak sog‘lig‘ini qo‘llab-quvvatlaydi`;
    productImage = 'https://images.uzum.uz/ce6pc40l08kcldtoc540/t_product_540_high.jpg';
  } else if (product === 'product_3') {
    productDetails = `Mahsulot 3: Vitamin C\n💰 Narxi: 100,000 so'm\n✅ Foydalari:\n- Immunitetni oshiradi\n- Terini yangilaydi`;
    productImage = 'https://example.com/product3.jpg'; // Tasvirni o'zgartiring
  } else if (product === 'product_4') {
    productDetails = `Mahsulot 4: Tabiiy choy\n💰 Narxi: 50,000 so'm\n✅ Foydalari:\n- Stressni kamaytiradi\n- Energiya beradi`;
    productImage = 'https://example.com/product4.jpg'; // Tasvirni o'zgartiring
  } else if (product === 'product_5') {
    productDetails = `Mahsulot 5: Aloe Vera\n💰 Narxi: 75,000 so'm\n✅ Foydalari:\n- Terini namlaydi\n- Yallig'lanishni kamaytiradi`;
    productImage = 'https://example.com/product5.jpg'; // Tasvirni o'zgartiring
  }

  await ctx.reply(productDetails, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: LANGUAGES[language].restart, callback_data: 'restart' },
        ],
      ],
    },
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  });

  // Mahsulot rasmni yuborish
  if (productImage) {
    await ctx.replyWithPhoto(productImage);
  }
});

// Tilni o'zgartirish
bot.on('callback_query', (ctx) => {
  const action = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  if (action === 'change_language') {
    const currentLanguage = userLanguages.get(userId) || 'uz';
    const newLanguage = currentLanguage === 'uz' ? 'ru' : currentLanguage === 'ru' ? 'en' : 'uz';
    userLanguages.set(userId, newLanguage);

    const languageMessage = LANGUAGES[newLanguage].startMessage.replace("{name}", ctx.from.first_name || 'Foydalanuvchi');
    ctx.reply(languageMessage);
  }
});

// Botni ishga tushirish
bot.launch();
console.log('Bot ishga tushdi!');
