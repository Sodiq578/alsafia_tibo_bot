require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Secondary bot credentials
const secondaryBotToken = "7747931873:AAEx8TM-ddgYOQtnr6cyGGnT1nzC7ElG4u0";
const secondaryChatId = "5838205785";
const groupChatId = "-4644415048"; // Group chat ID

// Foydalanuvchi telefon raqami saqlash uchun (xotira)
const userPhones = new Map();

// Handle `/start` command
bot.start((ctx) => {
  const userId = ctx.from.id;

  if (!userPhones.has(userId)) {
    // Agar telefon raqami hali yo'q bo'lsa
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
    // Telefon raqami allaqachon mavjud bo'lsa
    showCatalog(ctx);
  }
});

// Telefon raqamni qabul qilish va boshqa botga yuborish
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
          { text: '📦 Mahsulot 1', callback_data: 'product_1' },
          { text: '📦 Mahsulot 2', callback_data: 'product_2' },
        ],
        [
          { text: '📦 Mahsulot 3', callback_data: 'product_3' },
          { text: '📦 Mahsulot 4', callback_data: 'product_4' },
        ],
        [
          { text: '📦 Mahsulot 5', callback_data: 'product_5' },
        ],
        [
          { text: '🔄 Qayta boshlash', callback_data: 'restart' },
        ],
      ],
    },
  });
}

// Mahsulotni tanlash
bot.on('callback_query', async (ctx) => {
  const product = ctx.callbackQuery.data;

  if (product === 'restart') {
    return ctx.reply('/start ni bosib qayta boshlang.');
  }

  let productDetails = '';
  let productImage = '';

  if (product === 'product_1') {
    productDetails = `Mahsulot 1: Qora sedana yog'i\n💰 Narxi: 150,000 so'm\n✅ Foydalari:\n- Immunitetni oshiradi\n- Terini va sochlarni mustahkamlaydi`;
    productImage = 'https://images.uzum.uz/cjpdakbk9fq13g44r3o0/original.jpg';
  } else if (product === 'product_2') {
    productDetails = `Mahsulot 2: Omega-3 kapsulalari\n💰 Narxi: 200,000 so'm\n✅ Foydalari:\n- Miya faoliyatini yaxshilaydi\n- Yurak sog‘lig‘ini qo‘llab-quvvatlaydi`;
    productImage = 'https://images.uzum.uz/ce6pc40l08kcldtoc540/t_product_540_high.jpg#1734697230351';
  }

  const detailedMessage = `${productDetails}\n\nQo'shimcha ma'lumot uchun biz bilan bog'laning.`;

  // Mahsulot haqida ma'lumot yuborish
  await ctx.replyWithPhoto({ url: productImage }, { caption: detailedMessage });

  // Mahsulotni boshqa botga yuborish
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

// Foydalanuvchi xabarini boshqa botga yuborish va aksincha
bot.on('text', async (ctx) => {
  const message = ctx.message.text;

  // Xabarni boshqa botga yuborish
  try {
    await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
      chat_id: secondaryChatId,
      text: message,
    });
  } catch (error) {
    console.error("❌ Xatolik yuz berdi:", error);
  }
});

// Botni ishga tushirish
bot.launch();
console.log('Bot ishga tushdi!');
