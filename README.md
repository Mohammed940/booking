# Medical Booking Telegram Bot

A Telegram bot for medical appointment booking integrated with Supabase.

## Features

- Book appointments at medical centers and clinics
- View available time slots
- Automatic Supabase database integration
- Multi-step conversation flow
- Arabic language support
- Performance optimized with caching
- Admin panel for managing centers, clinics, and appointments

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

Run Supabase connection test:
```bash
npm run test-connection
```

## Architecture

The bot uses:
- Express.js for the web server
- node-telegram-bot-api for Telegram integration
- Supabase for data storage
- Caching to improve performance (5-minute cache expiration)
- Timeout handling for database requests (10-second timeout)

## Performance Optimizations

### Caching
- Medical centers, clinics, and time slots are cached for 5 minutes
- Reduces database load and improves response times
- Cache is automatically invalidated when bookings are made

### Request Timeout Handling
- All Supabase database requests have a 10-second timeout
- Prevents hanging requests from affecting bot performance
- Clear error messages for timeout scenarios

### Active Request Tracking
- Tracks active requests to prevent flooding
- 45-second timeout for user requests
- Delayed loading messages (only shown after 5 seconds)

## Troubleshooting

If the bot is responding slowly or sending duplicate messages:
1. Check that only one instance of the bot is running
2. Verify webhook configuration
3. Check logs for errors
4. Ensure environment variables are set correctly

### Performance Issues

If the bot is still responding slowly:

1. Check the logs for these messages:
   - "Returning cached [data type]" (indicates cache is working)
   - "Loading [data type] from Supabase" (indicates cache miss)
   - "Request timeout after 10000ms" (indicates timeout issues)

2. Verify database indexes exist on frequently queried columns:
   - `medical_centers.name`
   - `clinics.center_id`
   - `clinics.name`
   - `time_slots.clinic_id`
   - `time_slots.date`
   - `time_slots.is_available`

3. Check network connectivity to Supabase

For detailed performance testing instructions, see [PERFORMANCE_TESTING_GUIDE.md](PERFORMANCE_TESTING_GUIDE.md)