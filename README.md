# Medical Booking Telegram Bot

A Telegram bot for medical appointment booking integrated with Supabase.

## Features

- Book appointments at medical centers and clinics
- View available time slots
- Automatic Supabase database integration
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
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
ADMIN_CHAT_ID=your_admin_chat_id
```

## Database Setup

Create the following tables in your Supabase database:

### Medical Centers Table
```sql
CREATE TABLE medical_centers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Clinics Table
```sql
CREATE TABLE clinics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  center_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  center_name VARCHAR(255) NOT NULL,
  clinic_name VARCHAR(255) NOT NULL,
  date VARCHAR(10) NOT NULL,
  time VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'متاح',
  chat_id VARCHAR(255),
  patient_name VARCHAR(255),
  patient_age INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

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
- Supabase for data storage
- Caching to improve performance

## Troubleshooting

If the bot is responding slowly or sending duplicate messages:
1. Check that only one instance of the bot is running
2. Verify webhook configuration
3. Check logs for errors
4. Ensure environment variables are set correctly