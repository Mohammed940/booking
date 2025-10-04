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

## Accessing the Admin Panel

After deployment, you can access the admin panel through:

1. Visit your Vercel deployment URL (e.g., `https://your-project.vercel.app`) - you'll be redirected to the admin panel
2. Or visit directly: `https://your-project.vercel.app/admin-panel.html`

To use the admin API endpoints, you'll need to include your ADMIN_CHAT_ID in requests:
- As a header: `x-admin-id: YOUR_ADMIN_CHAT_ID`
- Or as a query parameter: `?adminId=YOUR_ADMIN_CHAT_ID`

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

### Admin Panel Access Issues

If you're getting a 404 error when trying to access the admin panel:
1. Make sure you've redeployed your application after the latest changes
2. Check that your vercel.json file includes proper routing for the admin panel
3. Verify that the admin-panel.html file exists in the public directory

If you're getting "Unauthorized access" when trying to use admin API endpoints:
1. Make sure your ADMIN_CHAT_ID environment variable is set correctly in Vercel
2. Verify that your ADMIN_CHAT_ID matches the chat ID from your Telegram conversation with the bot
3. You can find your chat ID by sending a message to your bot and checking the logs