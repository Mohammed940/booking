require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN } = require('./config');
const BotHandler = require('./botHandler');

// Check if we're running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Create Express app
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Medical Booking Bot',
    mode: isDevelopment ? 'development (polling)' : 'production (webhook)'
  });
});

// Get port from environment or use 3000 as default
const PORT = process.env.PORT || 3000;

let bot;
let botHandler;

// Initialize bot and handler
function initializeBot() {
  if (!bot) {
    if (isDevelopment) {
      // In development mode, use polling
      console.log('Starting bot in development mode with polling...');
      bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
    } else {
      // In production mode, use webhooks
      console.log('Starting bot in production mode with webhooks...');
      bot = new TelegramBot(TELEGRAM_TOKEN, {
        webHook: true
      });
    }

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

// Initialize the bot
initializeBot();

// Webhook endpoint (for production only)
if (!isDevelopment) {
  app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
}

// For Vercel, we need to export the app
if (process.env.NOW_REGION) {
  // Vercel specific initialization
  console.log('Running on Vercel');
  module.exports = app;
} else {
  // Local development or other platforms
  const server = app.listen(PORT, async () => {
    console.log(`Bot server running on port ${PORT}`);
    
    if (!isDevelopment) {
      // Set webhook after server starts (for production only)
      const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`;
      const webhookUrl = `${vercelUrl}/webhook`;
      
      try {
        await bot.setWebHook(webhookUrl);
        console.log(`Webhook set to: ${webhookUrl}`);
        
        // Send message to admin when bot starts
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
    } else {
      // In development mode, send message to admin
      console.log('Bot started in development mode with polling');
      const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
      if (ADMIN_CHAT_ID) {
        await bot.sendMessage(ADMIN_CHAT_ID, 
          '🩺 *Medical Booking Bot Started in Development Mode!*\n\n' +
          'Bot is now running with polling and ready for testing.\n' +
          'Send /help to any user for usage instructions.',
          { parse_mode: 'Markdown' }
        ).catch(console.error);
      }
    }
  });

  // Log when the bot is successfully started
  console.log('Medical Booking Bot is starting...');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Stopping Medical Booking Bot...');
    bot.stopPolling();
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('Stopping Medical Booking Bot...');
    bot.stopPolling();
    server.close(() => {
      process.exit(0);
    });
  });
}