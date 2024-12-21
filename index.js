require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Secondary bot credentials
const secondaryBotToken = "7747931873:AAEx8TM-ddgYOQtnr6cyGGnT1nzC7ElG4u0";
const secondaryChatId = "5838205785";
const groupChatId = "-4644415048"; // Group chat ID

// Handle `/start` command
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

// Handle contact sharing and relay to the secondary bot
bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name || 'Foydalanuvchi';

  const contactMessage = `📞 *Yangi kontakt*:\n*Ismi:* ${firstName}\n*Telefon raqam:* ${phoneNumber}`;

  // Send the contact to the secondary bot
  try {
    await axios.post(`https://api.telegram.org/bot${secondaryBotToken}/sendMessage`, {
      chat_id: secondaryChatId,
      text: contactMessage,
      parse_mode: 'Markdown',
    });
    ctx.reply("✅ Telefon raqamingiz muvaffaqiyatli tizimga yuborildi.");
  } catch (error) {
    console.error("❌ Xatolik yuz berdi:", error);
    ctx.reply("❌ Telefon raqam tizimga yuborishda xatolik yuz berdi.");
  }

  // Notify the group
  bot.telegram.sendMessage(groupChatId, contactMessage, { parse_mode: 'Markdown' });
});

// Handle product selection
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
  }

  const detailedMessage = `${productDetails}\n\nQo'shimcha ma'lumot olish uchun biz bilan bog'laning.`;
  
  // Send the product details
  await ctx.replyWithPhoto({ url: productImage }, { caption: detailedMessage });

  // Relay product selection to the secondary bot
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

// Listen for messages from the secondary bot
bot.on('text', async (ctx) => {
  const message = ctx.message.text;

  // Forward the message to the secondary bot
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
