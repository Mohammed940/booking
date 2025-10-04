require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN } = require('../config');
const BotHandler = require('../botHandler');

// Create Express app
const app = express();
app.use(express.json());

// Store bot instance
let bot;
let botHandler;

// Initialize bot and handler once
function initializeBot() {
  if (!bot) {
    // Create the bot instance with proper webhook settings for Vercel
    bot = new TelegramBot(TELEGRAM_TOKEN, {
      webHook: true,
      polling: false
    });
    
    // Initialize bot handler
    try {
      botHandler = new BotHandler(bot);
    } catch (error) {
      console.error('Error initializing bot handler:', error);
      process.exit(1);
    }
    
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
  }
}

// Initialize bot when module loads
initializeBot();

// Webhook endpoint - handles Telegram updates
app.post('/api/bot', (req, res) => {
  // Process the update
  bot.processUpdate(req.body);
  
  // Respond immediately to Telegram
  res.status(200).send('OK');
});

// Health check endpoint
app.get('/api/bot', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Medical Booking Bot'
  });
});

module.exports = app;