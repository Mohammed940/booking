// Test Google Sheets connection
require('dotenv').config();
const { google } = require('googleapis');
const { GOOGLE_SHEETS } = require('./config');

async function testGoogleSheets() {
  try {
    console.log('Testing Google Sheets connection...');
    
    // Check if credentials are provided
    if (!GOOGLE_SHEETS.CREDENTIALS) {
      console.error('ERROR: GOOGLE_CREDENTIALS not found in environment variables');
      return;
    }
    
    // Check if spreadsheet ID is provided
    if (!GOOGLE_SHEETS.SPREADSHEET_ID) {
      console.error('ERROR: SPREADSHEET_ID not found in environment variables');
      return;
    }
    
    console.log('Credentials and Spreadsheet ID found');
    
    // Initialize Google Sheets client
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SHEETS.CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = GOOGLE_SHEETS.SPREADSHEET_ID;
    
    console.log('Attempting to access spreadsheet:', spreadsheetId);
    
    // Try to read a small range from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'A1:B10',
    });
    
    console.log('✓ Successfully accessed spreadsheet!');
    console.log('Data retrieved:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('ERROR accessing Google Sheets:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    if (error.code === 404) {
      console.error('\nSOLUTION: Check your SPREADSHEET_ID - the spreadsheet was not found');
    } else if (error.code === 403) {
      console.error('\nSOLUTION: Check your Google Sheets credentials and sharing settings');
      console.error('1. Make sure you shared your spreadsheet with the service account email');
      console.error('2. Verify your credentials JSON is correct');
    } else {
      console.error('\nPlease check your configuration and try again');
    }
  }
}

// Run the test
testGoogleSheets();