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

### Production Deployment
For continuous operation, deploy using webhooks:

#### Deploy to Render
1. Fork this repository
2. Create a new Web Service on Render
3. Connect to your forked repository
4. Set the required environment variables
5. Deploy the service

#### Deploy to Railway
1. Fork this repository
2. Create a new Project on Railway
3. Connect to your forked repository
4. Set the required environment variables
5. Deploy the service

## Environment Variables

For production deployment, you need to set these environment variables:

```
NODE_ENV=production
TELEGRAM_TOKEN=your_telegram_bot_token
SPREADSHEET_ID=your_google_sheet_id
GOOGLE_CREDENTIALS=your_google_service_account_json_content
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

## Deployment Guides

- [Render Deployment Guide](file:///c%3A/Users/hussein%20tech/StudioProjects/New%20folder%20%284%29/RENDER_DEPLOYMENT_GUIDE.md)
- [Railway Deployment Guide](file:///c%3A/Users/hussein%20tech/StudioProjects/New%20folder%20%284%29/RAILWAY_DEPLOYMENT_GUIDE.md)

## License
This project is licensed under the MIT License.