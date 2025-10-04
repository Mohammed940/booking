# Vercel Deployment Guide for Medical Booking Bot

## Prerequisites

1. Make sure you have a Vercel account
2. Ensure all environment variables are set in your Vercel project settings
3. Verify your Supabase credentials are properly configured

## Environment Variables

Set these environment variables in your Vercel project:

```
TELEGRAM_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
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
2. Set your Telegram bot webhook to: `https://your-project.vercel.app/webhook`

Use this curl command to set the webhook:
```bash
curl -F "url=https://your-project.vercel.app/webhook" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```

Or use the setup script:
```bash
npm run setup-webhook
```

## Troubleshooting

### Bot responding slowly or multiple times

This usually happens due to:
1. Duplicate message processing
2. Multiple bot instances running
3. Improper webhook configuration

### Cache Settings

The bot uses caching to improve performance:
- Centers and clinics cache: 1 minute
- Slots cache: 1 minute

This reduces the number of Supabase database calls and improves response time.

### If problems persist

1. Check Vercel logs for errors
2. Verify environment variables are correctly set
3. Ensure Supabase credentials have proper permissions
4. Check that your database tables are correctly set up