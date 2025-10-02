require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN } = require('./config');
const BotHandler = require('./botHandler');

// إنشاء تطبيق Express
const app = express();
app.use(express.json());

// إنشاء البوت في وضع webhook
const bot = new TelegramBot(TELEGRAM_TOKEN);

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
    bot.sendMessage(
      msg.chat.id,
      'عذرًا، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.'
    );
  }
});

// معالج أزرار callback
bot.on('callback_query', async (query) => {
  try {
    await botHandler.handleCallbackQuery(query);
  } catch (error) {
    console.error('Error handling callback query:', error);
    bot.sendMessage(
      query.message.chat.id,
      'عذرًا، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.'
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});

// Log when the bot is successfully started
console.log('Medical Booking Bot is running...');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping Medical Booking Bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping Medical Booking Bot...');
  process.exit(0);
});