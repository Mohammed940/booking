// Configuration file for the Medical Booking Bot
// Store all sensitive information and settings here

// Load Google credentials from environment variable first, then from file if specified
let googleCredentials = null;

// First try to load from GOOGLE_CREDENTIALS environment variable
if (process.env.GOOGLE_CREDENTIALS && process.env.GOOGLE_CREDENTIALS !== 'your_google_credentials_json_here') {
  try {
    googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } catch (error) {
    console.error('Error parsing Google credentials from environment variable:', error);
  }
} 
// If that fails, try to load from file
else if (process.env.GOOGLE_CREDENTIALS_FILE) {
  try {
    googleCredentials = require(process.env.GOOGLE_CREDENTIALS_FILE);
    // Check if the credentials are placeholder values
    if (googleCredentials.project_id === 'your-project-id' || 
        googleCredentials.client_email.includes('your-service-account')) {
      console.warn('Warning: Google credentials file contains placeholder values. Google Sheets integration will not work.');
      googleCredentials = null;
    }
  } catch (error) {
    console.warn('Warning: Could not load Google credentials from file:', error.message);
  }
}

module.exports = {
  // Telegram Bot Token - Get this from @BotFather on Telegram
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE',
  
  // Google Sheets configuration
  GOOGLE_SHEETS: {
    // ID of your Google Sheet (found in the URL of your spreadsheet)
    SPREADSHEET_ID: process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE',
    
    // Credentials for Google Sheets API
    CREDENTIALS: googleCredentials
  },
  
  // Timezone configuration
  TIMEZONE: process.env.TIMEZONE || 'Asia/Riyadh', // UTC+3
  
  // Reminder settings
  REMINDER_MINUTES_BEFORE: 120, // 2 hours before appointment
};