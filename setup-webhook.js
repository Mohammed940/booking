/**
 * Script to set up Telegram webhook for Vercel deployment
 * 
 * Usage:
 * 1. Set TELEGRAM_TOKEN and VERCEL_URL environment variables
 * 2. Run: node setup-webhook.js
 */

require('dotenv').config();
const axios = require('axios');

async function setupWebhook() {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const VERCEL_URL = process.env.VERCEL_URL || process.env.DEPLOYMENT_URL;
  
  if (!TELEGRAM_TOKEN) {
    console.error('Error: TELEGRAM_TOKEN environment variable is required');
    process.exit(1);
  }
  
  if (!VERCEL_URL) {
    console.error('Error: VERCEL_URL or DEPLOYMENT_URL environment variable is required');
    process.exit(1);
  }
  
  // Ensure URL ends with /api/bot
  const webhookUrl = VERCEL_URL.endsWith('/api/bot') ? VERCEL_URL : `${VERCEL_URL}/api/bot`;
  
  try {
    console.log(`Setting webhook to: ${webhookUrl}`);
    
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`,
      {
        url: webhookUrl,
        max_connections: 40,
        allowed_updates: ['message', 'callback_query']
      }
    );
    
    if (response.data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`Webhook info: ${webhookUrl}`);
    } else {
      console.error('❌ Failed to set webhook:', response.data);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the setup
setupWebhook();