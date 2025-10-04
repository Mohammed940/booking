# Performance Testing Guide for Medical Booking Bot

## Overview

This guide explains how to test the performance improvements made to the Medical Booking Bot. The fixes include:

1. Increased cache expiration time (5 minutes instead of 1)
2. Added timeout handling for Supabase requests
3. Improved active request tracking
4. Enhanced error handling

## Prerequisites

Before testing, ensure you have:

1. Set up your Supabase credentials in environment variables:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon key

2. Created the required database tables using the schema in [DATABASE_SCHEMA.sql](file:///C:/Users/hussein%20tech/StudioProjects/New%20folder%20(4)/DATABASE_SCHEMA.sql)

3. Initialized the database with sample data:
   ```bash
   npm run init-db
   ```

## Testing Steps

### 1. Test Supabase Connection

Run the connection test script:
```bash
npm run test-connection
```

Expected output:
```
Testing Supabase connection...
Fetching medical centers...
Found X centers in Y ms:
  1. Center Name 1
  2. Center Name 2
  ...

Fetching clinics for first center...
Found X clinics in Y ms:
  1. Clinic Name 1
  2. Clinic Name 2
  ...

✅ Supabase connection test completed successfully!
```

### 2. Test Caching Performance

Run the connection test twice in quick succession:
```bash
npm run test-connection
# Wait 2-3 seconds
npm run test-connection
```

On the second run, you should see significantly faster response times because the data is cached.

Look for log messages like:
- "Returning cached centers data"
- "Returning cached clinics for center: [center name]"

### 3. Test Bot Performance

1. Start the bot in development mode:
   ```bash
   npm run dev
   ```

2. Open Telegram and message your bot

3. Send the command "حجز" (booking)

4. Observe the response time for:
   - Loading centers list
   - Loading clinics after selecting a center
   - Loading time slots after selecting a clinic

### 4. Test Cache Expiration

1. Run the connection test
2. Wait 5+ minutes
3. Run the connection test again
4. The first run after waiting should take longer as it fetches fresh data
5. Subsequent runs should be fast again

## Monitoring Performance

### Log Messages to Look For

1. **Cache Hits**:
   - "Returning cached centers data"
   - "Returning cached clinics for center: [name]"
   - "Returning cached slots for center: [name], clinic: [name]"

2. **Cache Misses**:
   - "Loading centers data from Supabase..."
   - "Loading clinics for center: [name]"
   - "Fetching time slots for center: [name], clinic: [name]"

3. **Performance Metrics**:
   - "Successfully loaded X centers"
   - "Successfully loaded X clinics for center: [name]"
   - "Found X available slots for center: [name], clinic: [name]"

4. **Error Conditions**:
   - "Request timeout after 10000ms"
   - "Error getting medical centers:"
   - "Error getting clinics:"
   - "Error getting available slots:"

### Response Time Expectations

- **Cached requests**: < 100ms
- **Database requests**: 500ms - 2000ms (depending on network and database load)
- **Timeout errors**: Should not occur under normal conditions

## Troubleshooting

### If Performance is Still Poor

1. Check your Supabase dashboard for query performance
2. Verify database indexes exist on:
   - `medical_centers.name`
   - `clinics.center_id`
   - `clinics.name`
   - `time_slots.clinic_id`
   - `time_slots.date`
   - `time_slots.is_available`

3. Check network connectivity to Supabase

### If Cache is Not Working

1. Verify cache expiration time in [supabaseService.js](file:///C:/Users/hussein%20tech/StudioProjects/New%20folder%20(4)/supabaseService.js):
   ```javascript
   this.CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
   ```

2. Check that cache keys are being set correctly

### If Timeout Errors Occur

1. Check your network connection
2. Verify Supabase credentials are correct
3. Consider increasing timeout values in [supabaseService.js](file:///C:/Users/hussein%20tech/StudioProjects/New%20folder%20(4)/supabaseService.js):
   ```javascript
   const data = await this.withTimeout(promise, 15000); // Increase from 10000 to 15000
   ```

## Rollback Plan

If the performance fixes cause issues:

1. Revert cache expiration to 1 minute:
   ```javascript
   this.CACHE_EXPIRATION = 1 * 60 * 1000; // 1 minute
   ```

2. Reduce request timeout to 30 seconds:
   ```javascript
   this.requestTimeout = 30000; // 30 seconds
   ```

3. Remove timeout wrapper:
   - Replace `await this.withTimeout(promise, 10000)` with direct `await promise`

## Additional Recommendations

1. Monitor Vercel logs after deployment for any performance issues
2. Consider implementing database connection pooling for high-traffic scenarios
3. Add performance monitoring tools for production environments