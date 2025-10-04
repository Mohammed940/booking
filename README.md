# Medical Booking Telegram Bot

A Telegram bot for medical appointment booking integrated with Google Sheets.

## Features

- Book appointments at medical centers and clinics
- View available time slots
- Automatic Google Sheets integration
- Multi-step conversation flow
- Arabic language support

## Setup

1. Clone this repository
2. Run `npm install`
3. Set up environment variables (see below)
4. Deploy to your preferred platform

## Environment Variables

Create a `.env` file with the following variables:

```
TELEGRAM_TOKEN=your_telegram_bot_token
SPREADSHEET_ID=your_google_spreadsheet_id
GOOGLE_APPLICATION_CREDENTIALS_BASE64=base64_encoded_google_credentials
ADMIN_CHAT_ID=your_admin_chat_id
```

## Deployment

### Vercel (Recommended)

See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Other Platforms

The bot can also be deployed to:
- Render (see [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md))
- Railway (see [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md))

## Usage

1. Start a conversation with your bot on Telegram
2. Send `/start` or `/help` to see instructions
3. Send `حجز` to start the booking process
4. Follow the prompts to select center, clinic, time slot, and enter patient details

## Development

Run in development mode:
```bash
npm run dev
```

Run in production mode:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

## Architecture

The bot uses:
- Express.js for the web server
- node-telegram-bot-api for Telegram integration
- Google Sheets API for data storage
- Caching to improve performance

## Troubleshooting

If the bot is responding slowly or sending duplicate messages:
1. Check that only one instance of the bot is running
2. Verify webhook configuration
3. Check logs for errors
4. Ensure environment variables are set correctly