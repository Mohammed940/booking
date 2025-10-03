# Medical Booking Bot

A comprehensive Telegram bot for medical appointment booking integrated with Google Sheets as a database.

## Features
- Book appointments through Telegram bot
- Manage medical centers and clinics
- Schedule appointments and show available time slots
- Store data in Google Sheets
- Collect patient information (name and age)

## Technologies Used
- Node.js
- Telegram Bot API
- Google Sheets API
- Express.js

## Setup

### Local Development
1. Create a bot on Telegram using BotFather
2. Set up Google Sheets with API credentials
3. Copy [.env.example](file:///c%3A/Users/hussein%20tech/StudioProjects/New%20folder%20%284%29/.env.example) to [.env](file:///c%3A/Users/hussein%20tech/StudioProjects/New%20folder%20%284%29/.env) and fill in your credentials
4. For Google credentials, either:
   - Set `GOOGLE_CREDENTIALS` environment variable with the JSON content, or
   - Create a `google-credentials.json` file in the project root (not committed to git)
5. Run the bot in development mode:
   ```bash
   npm install
   npm run dev
   ```

### Production Deployment (Webhooks on Render)
For continuous operation, deploy using webhooks:

1. Fork this repository
2. Create a new Web Service on Render
3. Connect to your forked repository
4. Set the required environment variables (see below)
5. Deploy the service

## Environment Variables

For production deployment on Render, you need to set these environment variables:

```
NODE_ENV=production
TELEGRAM_TOKEN=your_telegram_bot_token
SPREADSHEET_ID=your_google_sheet_id
GOOGLE_CREDENTIALS=your_google_service_account_json_content
RENDER_EXTERNAL_URL=https://your-service-name.onrender.com
```

Note: For security reasons, never commit Google credentials to the repository. Use environment variables instead.

## Installation
```bash
npm install
```

## Running the Bot

### Development Mode (Polling)
```bash
npm run dev
```

### Production Mode (Webhooks)
```bash
npm start
```

## Google Sheets Setup

1. Create a Google Sheet with the following columns:
   - A: المركز الصحي (Medical Center)
   - B: العيادة (Clinic)
   - C: التاريخ (Date)
   - D: الوقت (Time)
   - E: الحالة (Status)
   - F: معرف المستخدم (User ID)
   - G: اسم المريض (Patient Name)
   - H: عمر المريض (Patient Age)

2. Set up Google Sheets API:
   - Go to https://console.cloud.google.com/
   - Create a new project or select an existing one
   - Enable the Google Sheets API
   - Go to "Credentials" > "Create Credentials" > "Service Account"
   - Download the JSON key file
   - Share your Google Sheet with the service account email (found in the JSON file)
   - Give it editor access.

## Render Deployment Steps

1. Sign up for a Render account at https://render.com
2. Fork this repository to your GitHub account
3. In Render dashboard, click "New" > "Web Service"
4. Connect your GitHub account and select your forked repository
5. Configure the service:
   - Name: medical-booking-bot (or any name you prefer)
   - Region: Choose the region closest to your users
   - Branch: main
   - Root Directory: Leave empty
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables in the "Environment Variables" section:
   ```
   NODE_ENV=production
   TELEGRAM_TOKEN=8434810230:AAE0e_Nj5TyJbRd-_I6CMIOcwpAv2B5ugE0
   SPREADSHEET_ID=1NXeVxPgmSIZzZNT-ODPWkgbuRyOJE4i2NkOPg25zOTQ
   GOOGLE_CREDENTIALS={"type":"service_account","project_id":"sunlit-unison-458405-v8",...} (your full JSON content)
   RENDER_EXTERNAL_URL=https://your-service-name.onrender.com
   ```
7. Click "Create Web Service"
8. After deployment, update the RENDER_EXTERNAL_URL with your actual Render service URL
9. Restart the service

## License
This project is licensed under the MIT License.