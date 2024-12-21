require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const secondaryBotToken = "7747931873:AAEx8TM-ddgYOQtnr6cyGGnT1nzC7ElG4u0";
const secondaryChatId = "5838205785";
const groupChatId = "-4644415048"; // Guruh chat ID

// Boshlang'ich xabar (Shaxsiylashtirilgan salomlashish)
bot.start((ctx) => {
  const userFirstName = ctx.from.first_name || 'Foydalanuvchi';
  ctx.reply(`👋 Salom, ${userFirstName}! Telefon raqamingizni jo'natish uchun quyidagi tugmani bosing.`, {
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

// Telefon raqamni qabul qilish va boshqa botga yuborish
bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name || 'Foydalanuvchi';

  // Guruhga xabar yuborish
  let allMessages = `📞 *Yangi kontakt*:
*Ismi:* ${firstName}
*Telefon raqam:* ${phoneNumber}\n\n`;

  // Telefon raqamini boshqa botga yuborish
  try {
    await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
      chat_id: secondaryChatId,
      text: `Yangi kontakt:
Ismi: ${firstName}
Telefon raqam: ${phoneNumber}`,
    });
    allMessages += "✅ Telefon raqamingiz muvaffaqiyatli qabul qilindi va tizimga yuborildi.\n\n";
  } catch (error) {
    allMessages += "❌ Telefon raqamni boshqa botga yuborishda xatolik yuz berdi.\n\n";
    console.error(error);
  }

  // Mahsulotlar ro'yxatini chiqarish
  allMessages += '🛒 *Mahsulotlarimiz:*\n';
  allMessages += '1. Mahsulot 1\n2. Mahsulot 2\n3. Mahsulot 3\n4. Mahsulot 4\n5. Mahsulot 5\n\n';

  // Mahsulotlar haqida xabar yuborish
  bot.telegram.sendMessage(groupChatId, allMessages, { parse_mode: 'Markdown' });

  // Mahsulotlar ro'yxatini ko'rsatish
  ctx.reply('Mahsulotlarimizni tanlang yoki "Bizning saytimiz"ga tashrif buyuring:', {
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
          { text: '🔙 Orqaga', callback_data: 'back' },
          { text: '🌐 Bizning saytimiz', url: 'https://alsafiya.vercel.app/home' },
        ],
      ],
    },
  });
});

// Mahsulotlar haqida batafsil ma'lumot
bot.on('callback_query', async (ctx) => {
  const product = ctx.callbackQuery.data;
  let productDetails = '';
  let productImage = '';

  if (product === 'product_1') {
    productDetails = `Mahsulot 1: Qora sedana yog'i\n💰 Narxi: 150,000 so'm\n✅ Foydalari:\n- Immunitetni oshiradi\n- Terini va sochlarni mustahkamlaydi`;
    productImage = 'https://images.uzum.uz/cjpdakbk9fq13g44r3o0/original.jpg';
  } else if (product === 'product_2') {
    productDetails = `Mahsulot 2: Omega-3 kapsulalari\n💰 Narxi: 200,000 so'm\n✅ Foydalari:\n- Miya faoliyatini yaxshilaydi\n- Yurak sog‘lig‘ini qo‘llab-quvvatlaydi`;
    productImage = 'https://images.uzum.uz/ce6pc40l08kcldtoc540/t_product_540_high.jpg#1734697230351';
  } else if (product === 'product_3') {
    productDetails = `Mahsulot 3: Vitamin kompleksi\n💰 Narxi: 180,000 so'm\n✅ Foydalari:\n- Stressni kamaytiradi\n- Umumiy sog‘liqni yaxshilaydi`;
    productImage = 'https://images.uzum.uz/cjpdakbk9fq13g44r3o0/original.jpg';
  } else if (product === 'product_4') {
    productDetails = `Mahsulot 4: Vitamin C\n💰 Narxi: 120,000 so'm\n✅ Foydalari:\n- Immunitetni kuchaytiradi\n- Qon aylanishini yaxshilaydi`;
    productImage = 'https://images.uzum.uz/ce6pc40l08kcldtoc540/t_product_540_high.jpg#1734697230351';
  } else if (product === 'product_5') {
    productDetails = `Mahsulot 5: Glukozamin\n💰 Narxi: 250,000 so'm\n✅ Foydalari:\n- Tuxumdon va bo'g'imlarni mustahkamlaydi\n- Harakatlarni yaxshilaydi`;
    productImage = 'https://images.uzum.uz/cjpdakbk9fq13g44r3o0/original.jpg';
  } else if (product === 'back') {
    return ctx.reply('🔙 Orqaga qaytildi.', {
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
            { text: '🌐 Bizning saytimiz', url: 'https://alsafiya.vercel.app/home' },
          ],
        ],
      },
    });
  }

  // Mahsulot haqidagi batafsil ma'lumotni yuborish
  const detailedMessage = `${productDetails}\n\nHar bir mahsulot haqida qo'shimcha ma'lumot olish uchun biz bilan bog'laning.`;

  // Mahsulot rasmini va ma'lumotlarini yuborish
  await ctx.replyWithPhoto({ url: productImage }, { caption: detailedMessage });

  // Mahsulot haqidagi batafsil xabarni guruhga yuborish
  bot.telegram.sendMessage(groupChatId, `Mahsulot tanlandi: ${productDetails}`);
});

// Botni ishga tushirish
bot.launch();
console.log('Bot ishga tushdi!');
