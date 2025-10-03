require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN } = require('../config');
const BotHandler = require('../botHandler');

// Create Express app
const app = express();
app.use(express.json());

// Create the bot instance
const bot = new TelegramBot(TELEGRAM_TOKEN);

// Initialize bot handler
let botHandler;
try {
  botHandler = new BotHandler(bot);
} catch (error) {
  console.error('Error initializing bot handler:', error);
  process.exit(1);
}

// Webhook endpoint
app.post('/api/bot', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Message handler
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

// Callback query handler
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

module.exports = app;