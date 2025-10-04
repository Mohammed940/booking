/**
 * Simple test script to verify Supabase connection
 */

require('dotenv').config();
const SupabaseService = require('./supabaseService');

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    const supabaseService = new SupabaseService();
    
    console.log('Fetching medical centers...');
    const startTime = Date.now();
    const centers = await supabaseService.getMedicalCenters();
    const endTime = Date.now();
    
    console.log(`Found ${centers.length} centers in ${endTime - startTime}ms:`);
    centers.forEach((center, index) => {
      console.log(`  ${index + 1}. ${center}`);
    });
    
    if (centers.length > 0) {
      console.log('\nFetching clinics for first center...');
      const startTime2 = Date.now();
      const clinics = await supabaseService.getClinicsForCenter(centers[0]);
      const endTime2 = Date.now();
      
      console.log(`Found ${clinics.length} clinics in ${endTime2 - startTime2}ms:`);
      clinics.forEach((clinic, index) => {
        console.log(`  ${index + 1}. ${clinic}`);
      });
    }
    
    console.log('\n✅ Supabase connection test completed successfully!');
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();