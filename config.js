// Configuration file for the Medical Booking Bot
// Store all sensitive information and settings here

module.exports = {
  // Telegram Bot Token - Get this from @BotFather on Telegram
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE',
  
  // Supabase configuration
  SUPABASE: {
    // URL of your Supabase project
    URL: process.env.SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL_HERE',
    
    // API Key for your Supabase project
    KEY: process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'
  },
  
  // Timezone configuration
  TIMEZONE: process.env.TIMEZONE || 'Asia/Riyadh', // UTC+3
  
  // Reminder settings
  REMINDER_MINUTES_BEFORE: process.env.REMINDER_MINUTES_BEFORE || 120, // 2 hours before appointment
  
  // Admin Chat ID for notifications
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID || null,
  
  // Reminder service settings
  REMINDER_CHECK_INTERVAL: process.env.REMINDER_CHECK_INTERVAL || 60000 // 1 minute
};