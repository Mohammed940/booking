# Railway Deployment Guide

This guide explains how to deploy the Medical Booking Bot to Railway with webhooks for continuous operation.

## Prerequisites

1. A Railway account (https://railway.app)
2. A GitHub account
3. This repository forked to your GitHub account

## Deployment Steps

### 1. Fork the Repository

1. Go to your GitHub account
2. Fork this repository to your account

### 2. Create a New Project on Railway

1. Log in to your Railway account
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select your forked repository
5. Select the branch you want to deploy (usually `main`)

### 3. Configure Environment Variables

In the Railway dashboard, go to your project > Settings > Variables and add:

```
NODE_ENV=production
TELEGRAM_TOKEN=8434810230:AAE0e_Nj5TyJbRd-_I6CMIOcwpAv2B5ugE0
SPREADSHEET_ID=1NXeVxPgmSIZzZNT-ODPWkgbuRyOJE4i2NkOPg25zOTQ
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"sunlit-unison-458405-v8",...} (your full JSON content)
```

Important notes:
- **Never commit Google credentials to the repository**. Use the GOOGLE_CREDENTIALS environment variable instead.
- The GOOGLE_CREDENTIALS should contain the **full JSON content** of your service account key file.
- Railway will automatically assign a URL for your service. You can find it in the project settings under "Domains".

### 4. Configure Webhooks

Railway automatically provides a public URL for your service. After deployment:

1. Copy your Railway service URL (e.g., `https://medical-booking-bot-production.up.railway.app`)
2. Set it as the webhook URL for your Telegram bot using this API call:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://your-railway-url.up.railway.app/webhook
   ```

### 5. Deploy

Railway will automatically build and deploy your application. The build process will:

1. Install dependencies using `npm install`
2. Start the application using `npm start`

## Testing the Deployment

1. After deployment is complete, check the logs in Railway to ensure the bot started successfully
2. Open Telegram and search for your bot
3. Send "/start" or "حجز" to begin the booking process
4. Follow the prompts to test the functionality

## Troubleshooting

### Common Issues

1. **Bot not responding:**
   - Check that TELEGRAM_TOKEN is correct
   - Verify the webhook is set correctly using the getWebhookInfo API
   - Check Railway logs for errors

2. **Google Sheets errors:**
   - Ensure SPREADSHEET_ID is correct
   - Verify that the service account has access to the spreadsheet
   - Make sure the spreadsheet has the correct structure

3. **Webhook not working:**
   - Verify your Railway service URL is correctly set as the webhook
   - Check that the URL is accessible from the internet

### Checking Logs

You can view detailed logs in the Railway dashboard:
1. Go to your project
2. Click "Logs"
3. Check for any error messages

### Manual Webhook Reset

If you need to manually reset the webhook, you can use these Telegram Bot API endpoints:
- Set webhook: `https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://your-railway-url.up.railway.app/webhook`
- Delete webhook: `https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook`
- Get webhook info: `https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo`

## Updates and Maintenance

To update your bot:
1. Push changes to your GitHub repository
2. Railway will automatically redeploy the service
3. You can also manually trigger a deploy from the Railway dashboard

## Security Considerations

1. Keep your TELEGRAM_TOKEN and Google credentials secure
2. Don't commit sensitive information to version control
3. Use environment variables for all sensitive data
4. Regularly check your Google Sheets permissions
5. Rotate your credentials periodically