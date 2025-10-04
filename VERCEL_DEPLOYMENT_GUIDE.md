# Vercel Deployment Guide for Medical Booking Bot

This guide explains how to properly deploy your Medical Booking Telegram Bot to Vercel.

## Prerequisites

1. Make sure you have a Vercel account
2. Ensure all environment variables are set in your Vercel project settings
3. Verify your Google Sheets credentials are properly configured

## Environment Variables

Set these environment variables in your Vercel project:

```
TELEGRAM_TOKEN=your_telegram_bot_token
SPREADSHEET_ID=your_google_spreadsheet_id
GOOGLE_APPLICATION_CREDENTIALS_BASE64=base64_encoded_google_credentials
ADMIN_CHAT_ID=your_admin_chat_id
NODE_ENV=production
```

## Deployment Steps

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Set the build command to: `npm install`
4. Set the output directory to: ` `
5. Add all environment variables mentioned above
6. Deploy!

## Webhook Configuration

After deployment:

1. Get your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Set your Telegram bot webhook to: `https://your-project.vercel.app/api/bot`

Use this curl command to set the webhook:
```bash
curl -F "url=https://your-project.vercel.app/api/bot" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```

## Troubleshooting

### Bot responding slowly or multiple times

This usually happens due to:
1. Duplicate message processing
2. Multiple bot instances running
3. Improper webhook configuration

### Cache Settings

The bot uses caching to improve performance:
- Centers and clinics cache: 2 minutes
- Slots cache: 2 minutes

This reduces the number of Google Sheets API calls and improves response time.

### If problems persist

1. Check Vercel logs for errors
2. Verify environment variables are correctly set
3. Ensure Google Sheets credentials have proper permissions
4. Check that your spreadsheet ID is correct