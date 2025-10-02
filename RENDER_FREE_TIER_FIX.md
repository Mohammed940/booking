# Fixing Render Free Tier Issue

## Problem Identified
Render was requesting an upgrade because your bot was using `node-cron` for scheduled tasks (reminder jobs). Render considers cron jobs as background worker features that require a paid plan.

## Solution Implemented
1. **Removed cron functionality** from the bot to make it compatible with the free tier
2. **Removed `node-cron` dependency** from package.json
3. **Simplified the bot** to work purely as a web service responding to Telegram webhook events

## Changes Made

### 1. Removed Cron Dependencies
- Removed `const cron = require('node-cron');` from botHandler.js
- Removed the `setupCronJobs()` method
- Removed the `sendReminders()` method
- Removed cron job initialization from the constructor

### 2. Updated package.json
- Removed `node-cron` from dependencies

### 3. Maintained Core Functionality
- All booking features still work (centers, clinics, time slots, patient info)
- Webhook support for Telegram messages
- Google Sheets integration for data storage

## How to Deploy on Render Free Tier

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "Remove cron functionality to support Render free tier"
git push origin main
```

### 2. Redeploy on Render
1. Go to your Render dashboard
2. Find your service
3. Click "Manual Deploy" > "Deploy latest commit"
4. Wait for deployment to complete

### 3. Verify Deployment
- Check the logs for any errors
- Test the bot by sending "حجز" to your Telegram bot
- Visit your service URL + `/health` to check if it's running

## Why This Fixes the Issue
Render's free tier supports:
- Web services that respond to HTTP requests
- Webhook-based applications
- Standard Node.js applications

Render's free tier does NOT support:
- Background workers
- Scheduled tasks (cron jobs)
- Long-running processes

By removing the cron functionality, your bot now qualifies for the free tier since it only responds to incoming Telegram webhook events.

## Future Considerations
If you need reminder functionality in the future, consider:
1. Using a separate paid service for cron jobs
2. Implementing a simple reminder system within the bot's message handling
3. Using Google Apps Script with time-driven triggers for reminders