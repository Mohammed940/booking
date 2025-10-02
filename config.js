// Configuration file for the Medical Booking Bot
// Store all sensitive information and settings here

module.exports = {
  // Telegram Bot Token - Get this from @BotFather on Telegram
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE',
  
  // Google Sheets configuration
  GOOGLE_SHEETS: {
    // ID of your Google Sheet (found in the URL of your spreadsheet)
    SPREADSHEET_ID: process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE',
    
    // Credentials for Google Sheets API
    // This should be the content of your service account key JSON file
    CREDENTIALS: process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : null
  },
  
  // Timezone configuration
  TIMEZONE: 'Asia/Riyadh', // UTC+3
  
  // Reminder settings
  REMINDER_MINUTES_BEFORE: 120, // 2 hours before appointment
};