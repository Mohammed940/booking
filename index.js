require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN } = require('./config');
const BotHandler = require('./botHandler');

// إنشاء تطبيق Express
const app = express();
app.use(express.json());

// نقطة نهاية للتحقق من صحة الخدمة
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Medical Booking Bot'
  });
});

// الحصول على منفذ التشغيل من البيئة أو استخدام 3000 كافتراضي
const PORT = process.env.PORT || 3000;

// إنشاء البوت في وضع webhook مع إعدادات Render
const bot = new TelegramBot(TELEGRAM_TOKEN, {
  webHook: true,
  port: PORT
});

// تهيئة معالج البوت
let botHandler;
try {
  botHandler = new BotHandler(bot);
} catch (error) {
  console.error('Error initializing bot handler:', error);
  process.exit(1);
}

// نقطة النهاية لـ webhook
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// معالج الرسائل
bot.on('message', async (msg) => {
  try {
    await botHandler.handleMessage(msg);
  } catch (error) {
    console.error('Error handling message:', error);
    try {
      await bot.sendMessage(
        msg.chat.id,
        'عذرًا، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.'
      );
    } catch (sendError) {
      console.error('Error sending error message:', sendError);
    }
  }
});

// معالج أزرار callback
bot.on('callback_query', async (query) => {
  try {
    await botHandler.handleCallbackQuery(query);
  } catch (error) {
    console.error('Error handling callback query:', error);
    try {
      await bot.sendMessage(
        query.message.chat.id,
        'عذرًا، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.'
      );
    } catch (sendError) {
      console.error('Error sending error message:', sendError);
    }
  }
});

// بدء تشغيل خادم Express
app.listen(PORT, async () => {
  console.log(`Bot server running on port ${PORT}`);
  
  // إعداد webhook للبوت بعد بدء تشغيل الخادم
  const renderUrl = process.env.RENDER_EXTERNAL_URL || `https://localhost:${PORT}`;
  const webhookUrl = `${renderUrl}/webhook`;
  
  try {
    await bot.setWebHook(webhookUrl);
    console.log(`Webhook set to: ${webhookUrl}`);
    
    // إرسال رسالة إلى المشرف عند بدء تشغيل البوت
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    if (ADMIN_CHAT_ID) {
      await bot.sendMessage(ADMIN_CHAT_ID, 
        '🩺 *Medical Booking Bot Started Successfully!*\n\n' +
        'Bot is now running and ready to accept bookings.\n' +
        'Send /help to any user for usage instructions.',
        { parse_mode: 'Markdown' }
      ).catch(console.error);
    }
  } catch (error) {
    console.error('Error setting webhook:', error);
  }
});

// Log when the bot is successfully started
console.log('Medical Booking Bot is starting...');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping Medical Booking Bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping Medical Booking Bot...');
  process.exit(0);
});