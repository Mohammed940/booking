# Admin Panel Access Guide After Vercel Deployment

## Steps to Access the Admin Panel:

### 1. Verify Environment Variables
Before accessing the admin panel, ensure the following environment variables are set in Vercel:

- `TELEGRAM_TOKEN` - Your Telegram bot token
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `ADMIN_CHAT_ID` - Admin chat ID (recommended for security)

### 2. Deploy to Vercel
Make sure you've deployed the latest version of the code that includes these updates:
- Updated vercel.json to fix routing issues
- Updated admin-panel.html to add admin ID input field
- Updated admin-api.js to improve authentication verification

### 3. Access the Admin Panel
After deploying to Vercel, you can access the admin panel through:

1. Visit your site's main URL: `https://your-vercel-url.vercel.app`
   - You'll be automatically redirected to the admin panel

2. Or visit directly: `https://your-vercel-url.vercel.app/admin-panel.html`

### 4. Set Up Admin ID
To access admin functions, you need to set up your admin ID:

1. Open Telegram app
2. Start a conversation with your bot
3. Send the `/start` command
4. The bot will send you the chat ID
5. Copy this ID and enter it in the "Admin ID" field in the admin panel
6. Click "Save ID"

### 5. Fixing "404: NOT_FOUND" Error
If you get a "404: NOT_FOUND" error when trying to access the admin panel:

1. Make sure you've deployed the latest version of the code
2. Verify that your vercel.json file contains the correct routes:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/bot.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/webhook",
         "dest": "/api/bot"
       },
       {
         "src": "/api/bot",
         "dest": "/api/bot.js"
       },
       {
         "src": "/api/admin/(.*)",
         "dest": "/api/bot.js"
       },
       {
         "src": "/api/reminders/(.*)",
         "dest": "/api/bot.js"
       },
       {
         "src": "/admin-panel.html",
         "dest": "/api/bot.js"
       },
       {
         "src": "/",
         "dest": "/api/bot.js"
       },
       {
         "src": "/health",
         "dest": "/api/bot.js"
       }
     ]
   }
   ```

3. Redeploy your project to Vercel

### 6. Fixing "Unauthorized access" Error
If you get an "Unauthorized access" error when trying to access the admin API:

1. Make sure you've entered the admin ID in the admin panel
2. Verify that ADMIN_CHAT_ID in Vercel settings matches your chat ID
3. If you don't want to set ADMIN_CHAT_ID in Vercel (for development), make sure to enter the ID in the admin panel

### 7. Using the Admin API Directly
You can also use the admin API directly by sending HTTP requests to these endpoints:

- Add medical center: `POST /api/admin/centers?adminId=YOUR_ADMIN_ID`
- Add clinic: `POST /api/admin/clinics?adminId=YOUR_ADMIN_ID`
- Add time slots: `POST /api/admin/slots?adminId=YOUR_ADMIN_ID`
- Get all centers: `GET /api/admin/centers?adminId=YOUR_ADMIN_ID`
- Get clinics for a center: `GET /api/admin/clinics/:centerName?adminId=YOUR_ADMIN_ID`
- Get appointments: `GET /api/admin/appointments?adminId=YOUR_ADMIN_ID`

### 8. Troubleshooting
If problems persist:

1. Check Vercel logs for errors
2. Verify all environment variables are set correctly
3. Ensure Supabase credentials are correct and have proper permissions
4. Confirm database tables are created correctly using the DATABASE_SCHEMA.sql file

### 9. Security
For maximum security:
1. Set ADMIN_CHAT_ID in Vercel settings
2. Don't share your admin ID with others
3. Use a strong password for your Supabase account
4. Regularly update your environment variables