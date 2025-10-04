/**
 * Simple test script to verify Google Sheets connection
 */

require('dotenv').config();
const GoogleSheetsService = require('./googleSheetsService');

async function testConnection() {
  console.log('Testing Google Sheets connection...');
  
  try {
    const sheetsService = new GoogleSheetsService();
    
    if (sheetsService.disabled) {
      console.log('Google Sheets service is disabled');
      return;
    }
    
    console.log('Fetching medical centers...');
    const startTime = Date.now();
    const centers = await sheetsService.getMedicalCenters();
    const endTime = Date.now();
    
    console.log(`Found ${centers.length} centers in ${endTime - startTime}ms:`);
    centers.forEach((center, index) => {
      console.log(`  ${index + 1}. ${center}`);
    });
    
    if (centers.length > 0) {
      console.log('\nFetching clinics for first center...');
      const startTime2 = Date.now();
      const clinics = await sheetsService.getClinicsForCenter(centers[0]);
      const endTime2 = Date.now();
      
      console.log(`Found ${clinics.length} clinics in ${endTime2 - startTime2}ms:`);
      clinics.forEach((clinic, index) => {
        console.log(`  ${index + 1}. ${clinic}`);
      });
    }
    
    console.log('\n✅ Google Sheets connection test completed successfully!');
  } catch (error) {
    console.error('❌ Google Sheets connection test failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();