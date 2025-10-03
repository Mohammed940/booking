# Render Deployment Guide

This guide explains how to deploy the Medical Booking Bot to Render with webhooks for continuous operation.

## Prerequisites

1. A Render account (https://render.com)
2. A GitHub account
3. This repository forked to your GitHub account

## Deployment Steps

### 1. Fork the Repository

1. Go to your GitHub account
2. Fork this repository to your account

### 2. Create a New Web Service on Render

1. Log in to your Render account
2. Click "New" > "Web Service"
3. Connect your GitHub account and select your forked repository
4. Configure the service:
   - **Name**: medical-booking-bot (or any name you prefer)
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your preferred branch)
   - **Root Directory**: Leave empty if the code is in the root
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Configure Environment Variables

In the Render dashboard, go to your service > Settings > Environment Variables and add:

```
NODE_ENV=production
TELEGRAM_TOKEN=8434810230:AAE0e_Nj5TyJbRd-_I6CMIOcwpAv2B5ugE0
SPREADSHEET_ID=1NXeVxPgmSIZzZNT-ODPWkgbuRyOJE4i2NkOPg25zOTQ
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"sunlit-unison-458405-v8",...} (your full JSON content)
RENDER_EXTERNAL_URL=https://your-service-name.onrender.com
```

Important notes:
- Replace `your-service-name` in RENDER_EXTERNAL_URL with your actual Render service name
- **Never commit Google credentials to the repository**. Use the GOOGLE_CREDENTIALS environment variable instead.
- The GOOGLE_CREDENTIALS should contain the **full JSON content** of your service account key file.

### 4. Deploy

Click "Create Web Service" to deploy your bot. Render will automatically build and deploy your application.

## Webhook Configuration

The bot automatically configures the webhook when it starts. The webhook URL will be:
`https://your-service-name.onrender.com/webhook`

You can verify the webhook is set correctly by visiting:
`https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo`

## Testing the Deployment

1. After deployment is complete, check the logs in Render to ensure the bot started successfully
2. Open Telegram and search for your bot
3. Send "/start" or "حجز" to begin the booking process
4. Follow the prompts to test the functionality

## Troubleshooting

### Common Issues

1. **Bot not responding:**
   - Check that TELEGRAM_TOKEN is correct
   - Verify the webhook is set correctly using the getWebhookInfo API
   - Check Render logs for errors

2. **Google Sheets errors:**
   - Ensure SPREADSHEET_ID is correct
   - Verify that the service account has access to the spreadsheet
   - Make sure the spreadsheet has the correct structure

3. **Webhook not working:**
   - Verify RENDER_EXTERNAL_URL is set correctly
   - Check that the URL is accessible from the internet
   - Ensure the port is set to 3000 or the PORT environment variable

### Checking Logs

You can view detailed logs in the Render dashboard:
1. Go to your service
2. Click "Logs"
3. Check for any error messages

### Manual Webhook Reset

If you need to manually reset the webhook, you can use these Telegram Bot API endpoints:
- Set webhook: `https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://your-service-name.onrender.com/webhook`
- Delete webhook: `https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook`
- Get webhook info: `https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo`

## Updates and Maintenance

To update your bot:
1. Push changes to your GitHub repository
2. Render will automatically redeploy the service
3. You can also manually trigger a deploy from the Render dashboard

## Security Considerations

1. Keep your TELEGRAM_TOKEN and Google credentials secure
2. Don't commit sensitive information to version control
3. Use environment variables for all sensitive data
4. Regularly check your Google Sheets permissions
5. Rotate your credentials periodically