require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Standart tilni saqlash uchun o'zgaruvchi
let userLanguage = 'uz';

// Til tanlash menyusi
bot.start((ctx) => {
  ctx.reply('Tilni tanlang / Выберите язык', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'O‘zbekcha', callback_data: 'lang_uz' }, { text: 'Русский', callback_data: 'lang_ru' }],
      ],
    },
  });
});

// Til tanlash va asosiy menyuga o'tish
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data.startsWith('lang_')) {
    userLanguage = data.split('_')[1];
    const welcomeMessage =
      userLanguage === 'uz'
        ? '👋 Salom! Telefon raqamingizni jo‘natish uchun quyidagi tugmani bosing.'
        : '👋 Привет! Нажмите кнопку ниже, чтобы отправить свой номер телефона.';
    ctx.reply(welcomeMessage, {
      reply_markup: {
        keyboard: [
          [
            {
              text: userLanguage === 'uz' ? '📱 Telefon raqamni jo‘natish' : '📱 Отправить номер телефона',
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
});

// Telefon raqamni qabul qilish
bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name || (userLanguage === 'uz' ? 'Foydalanuvchi' : 'Пользователь');

  const successMessage =
    userLanguage === 'uz'
      ? '✅ Telefon raqamingiz qabul qilindi!'
      : '✅ Ваш номер телефона принят!';

  ctx.reply(successMessage);

  // Asosiy menyuni ko'rsatish
  showMainMenu(ctx);
});

// Asosiy menyu
function showMainMenu(ctx) {
  const productListMessage =
    userLanguage === 'uz'
      ? 'Mahsulotlarimizni tanlang yoki "Bizning saytimiz"ga tashrif buyuring:'
      : 'Выберите наши продукты или посетите "Наш сайт":';

  ctx.reply(productListMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📦 Qora sedana', callback_data: 'product_sedana' },
          { text: '📦 Kist ul hindi', callback_data: 'product_kist' },
        ],
        [
          { text: '📦 Omega-3', callback_data: 'product_omega' },
          { text: '📦 Vitamin C', callback_data: 'product_vitamin' },
        ],
        [
          { text: '🌐 Bizning saytimiz', url: 'https://alsafiya.vercel.app/home' },
          { text: userLanguage === 'uz' ? '🔄 Tilni o‘zgartirish' : '🔄 Сменить язык', callback_data: 'change_lang' },
        ],
      ],
    },
  });
}

// Mahsulotlar haqida batafsil
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === 'change_lang') {
    return bot.start(ctx);
  }

  let productDetails = '';
  let productImage = '';

  if (data === 'product_sedana') {
    productDetails = userLanguage === 'uz'
      ? `Qora sedana yog'i
💰 Narxi: 150,000 so'm
✅ Foydalari:
- Immunitetni mustahkamlaydi.
- Teri salomatligini yaxshilaydi.
- Organizmni toksinlardan tozalaydi.`
      : `Масло черного тмина
💰 Цена: 150,000 сум
✅ Польза:
- Укрепляет иммунитет.
- Улучшает здоровье кожи.
- Очищает организм от токсинов.`;
    productImage = 'https://images.uzum.uz/cjpdakbk9fq13g44r3o0/original.jpg';
  } else if (data === 'product_kist') {
    productDetails = userLanguage === 'uz'
      ? `Kist ul hindi
💰 Narxi: 120,000 so'm
✅ Foydalari:
- Nafas yo'llarini tozalaydi.
- Shamollashni kamaytiradi.
- Ichki organlarga foydali.`
      : `Кист ул хинди
💰 Цена: 120,000 сум
✅ Польза:
- Очищает дыхательные пути.
- Снижает воспаление.
- Полезен для внутренних органов.`;
    productImage = 'https://images.uzum.uz/ce6pc40l08kcldtoc540/t_product_540_high.jpg';
  } else if (data === 'product_omega') {
    productDetails = userLanguage === 'uz'
      ? `Omega-3
💰 Narxi: 180,000 so'm
✅ Foydalari:
- Yurak faoliyatini yaxshilaydi.
- Miya faoliyatini rag'batlantiradi.
- Tana yallig'lanishini kamaytiradi.`
      : `Омега-3
💰 Цена: 180,000 сум
✅ Польза:
- Улучшает работу сердца.
- Стимулирует работу мозга.
- Снижает воспаление в организме.`;
    productImage = 'https://images.uzum.uz/cj5nhdfg49devoab7vtg/t_product_540_high.jpg';
  } else if (data === 'product_vitamin') {
    productDetails = userLanguage === 'uz'
      ? `Vitamin C
💰 Narxi: 90,000 so'm
✅ Foydalari:
- Immunitetni kuchaytiradi.
- Yaralarning tez bitishini ta'minlaydi.
- Teri salomatligini yaxshilaydi.`
      : `Витамин C
💰 Цена: 90,000 сум
✅ Польза:
- Укрепляет иммунитет.
- Способствует быстрому заживлению ран.
- Улучшает здоровье кожи.`;
    productImage = 'https://images.uzum.uz/ce6ok40l08kcldtoc52g/t_product_540_high.jpg';
  }

  if (productDetails) {
    await ctx.replyWithPhoto({ url: productImage }, { caption: productDetails });
    ctx.reply(userLanguage === 'uz' ? 'Boshqa mahsulotlarni tanlash uchun orqaga qayting.' : 'Вернитесь назад, чтобы выбрать другие продукты.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: userLanguage === 'uz' ? '🔙 Orqaga' : '🔙 Назад', callback_data: 'back' }],
        ],
      },
    });
  }

  if (data === 'back') {
    showMainMenu(ctx);
  }
});

// Botni ishga tushirish
bot.launch();
console.log('Bot ishga tushdi!');
