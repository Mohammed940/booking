require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const { TELEGRAM_TOKEN, ADMIN_CHAT_ID } = require('../config');
const BotHandler = require('../botHandler');
const AdminPanelService = require('../admin-panel');
const ReminderService = require('../reminder-service');
const adminApi = require('../admin-api');

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Use admin API routes
app.use('/api/admin', adminApi);

// Store bot instance
let bot;
let botHandler;
let adminPanel;
let reminderService;

// Initialize services
function initializeServices() {
  if (!bot) {
    // Create the bot instance with proper webhook settings for Vercel
    bot = new TelegramBot(TELEGRAM_TOKEN, {
      webHook: true,
      polling: false
    });
    
    // Initialize bot handler
    try {
      botHandler = new BotHandler(bot);
      adminPanel = new AdminPanelService();
      reminderService = new ReminderService(TELEGRAM_TOKEN);
    } catch (error) {
      console.error('Error initializing services:', error);
      process.exit(1);
    }
    
    // Message handler
    bot.on('message', async (msg) => {
      try {
        // Check if it's an admin command
        if (msg.chat.id.toString() === ADMIN_CHAT_ID && msg.text === '/admin') {
          const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
          await bot.sendMessage(
            msg.chat.id,
            'مرحبًا أيها المدير!\n' +
            'يمكنك استخدام لوحة الإدارة عبر الرابط التالي:\n' +
            `${vercelUrl}/admin-panel.html\n\n` +
            'أو يمكنك استخدام الواجهة البرمجية عبر المسار: /api/admin'
          );
          return;
        }
        
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

// Initialize services when module loads
initializeServices();

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

// Admin panel HTML endpoint
app.get('/admin-panel.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-panel.html'));
});

// Reminder service endpoints
// Check and send reminders
app.post('/api/reminders/check', async (req, res) => {
  try {
    await reminderService.checkAndSendReminders();
    res.status(200).json({ success: true, message: 'Reminders checked and sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pending reminders
app.get('/api/reminders/pending', async (req, res) => {
  try {
    const reminders = await reminderService.getPendingReminders();
    res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sent reminders
app.get('/api/reminders/sent', async (req, res) => {
  try {
    const reminders = await reminderService.getSentReminders();
    res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;