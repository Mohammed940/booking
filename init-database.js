/**
 * Database initialization script for Supabase
 * This script creates sample data for testing
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE } = require('./config');

async function initDatabase() {
  console.log('Initializing Supabase database with sample data...');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE.URL, SUPABASE.KEY);
    
    // Sample medical centers
    const centers = [
      { name: 'مستشفى الملك فهد' },
      { name: 'مركز الأمير سلطان الصحي' },
      { name: 'مستشفى الملك عبدالعزيز الجامعي' }
    ];
    
    // Insert centers
    console.log('Inserting medical centers...');
    const { data: centersData, error: centersError } = await supabase
      .from('medical_centers')
      .insert(centers);
    
    if (centersError) {
      console.error('Error inserting centers:', centersError);
      return;
    }
    
    console.log('Medical centers inserted successfully');
    
    // Sample clinics
    const clinics = [
      { name: 'قسم القلب', center_name: 'مستشفى الملك فهد' },
      { name: 'قسم العيون', center_name: 'مستشفى الملك فهد' },
      { name: 'قسم الأسنان', center_name: 'مستشفى الملك فهد' },
      { name: 'قسم الجراحة', center_name: 'مستشفى الملك فهد' },
      { name: 'قسم الأطفال', center_name: 'مركز الأمير سلطان الصحي' },
      { name: 'قسم النساء والولادة', center_name: 'مركز الأمير سلطان الصحي' },
      { name: 'قسم الطوارئ', center_name: 'مركز الأمير سلطان الصحي' },
      { name: 'قسم الأشعة', center_name: 'مستشفى الملك عبدالعزيز الجامعي' },
      { name: 'قسم المختبرات', center_name: 'مستشفى الملك عبدالعزيز الجامعي' },
      { name: 'قسم العلاج الطبيعي', center_name: 'مستشفى الملك عبدالعزيز الجامعي' }
    ];
    
    // Insert clinics
    console.log('Inserting clinics...');
    const { data: clinicsData, error: clinicsError } = await supabase
      .from('clinics')
      .insert(clinics);
    
    if (clinicsError) {
      console.error('Error inserting clinics:', clinicsError);
      return;
    }
    
    console.log('Clinics inserted successfully');
    
    // Sample appointments for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const year = tomorrow.getFullYear();
    const tomorrowDate = `${day}/${month}/${year}`;
    
    const appointments = [
      { 
        center_name: 'مستشفى الملك فهد', 
        clinic_name: 'قسم القلب', 
        date: tomorrowDate, 
        time: '09:00',
        status: 'متاح'
      },
      { 
        center_name: 'مستشفى الملك فهد', 
        clinic_name: 'قسم القلب', 
        date: tomorrowDate, 
        time: '10:30',
        status: 'متاح'
      },
      { 
        center_name: 'مستشفى الملك فهد', 
        clinic_name: 'قسم القلب', 
        date: tomorrowDate, 
        time: '14:00',
        status: 'متاح'
      },
      { 
        center_name: 'مركز الأمير سلطان الصحي', 
        clinic_name: 'قسم الأطفال', 
        date: tomorrowDate, 
        time: '08:30',
        status: 'متاح'
      },
      { 
        center_name: 'مركز الأمير سلطان الصحي', 
        clinic_name: 'قسم الأطفال', 
        date: tomorrowDate, 
        time: '11:00',
        status: 'متاح'
      },
      { 
        center_name: 'مستشفى الملك عبدالعزيز الجامعي', 
        clinic_name: 'قسم الأشعة', 
        date: tomorrowDate, 
        time: '09:30',
        status: 'متاح'
      },
      { 
        center_name: 'مستشفى الملك عبدالعزيز الجامعي', 
        clinic_name: 'قسم الأشعة', 
        date: tomorrowDate, 
        time: '13:00',
        status: 'متاح'
      }
    ];
    
    // Insert appointments
    console.log('Inserting appointments...');
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointments);
    
    if (appointmentsError) {
      console.error('Error inserting appointments:', appointmentsError);
      return;
    }
    
    console.log('Appointments inserted successfully');
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('You can now test the bot with the sample data.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Error details:', error);
  }
}

initDatabase();