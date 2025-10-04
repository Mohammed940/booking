/**
 * Professional Database Initialization Script for Supabase
 * This script creates the complete database schema and sample data
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE } = require('./config');

async function initProfessionalDatabase() {
  console.log('Initializing professional Supabase database with complete schema...');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE.URL, SUPABASE.KEY);
    
    // Sample medical centers
    const centers = [
      { 
        name: 'مستشفى الملك فهد', 
        address: 'شارع الملك فهد، الرياض', 
        phone: '920012345' 
      },
      { 
        name: 'مركز الأمير سلطان الصحي', 
        address: 'حي الملز، الرياض', 
        phone: '920012346' 
      },
      { 
        name: 'مستشفى الملك عبدالعزيز الجامعي', 
        address: 'جامعة الملك سعود، الرياض', 
        phone: '920012347' 
      }
    ];
    
    // Insert centers
    console.log('Inserting medical centers...');
    const { data: centersData, error: centersError } = await supabase
      .from('medical_centers')
      .insert(centers)
      .select();
    
    if (centersError) {
      console.error('Error inserting centers:', centersError);
      return;
    }
    
    console.log('Medical centers inserted successfully');
    
    // Get the inserted centers with their IDs
    const insertedCenters = await supabase
      .from('medical_centers')
      .select('id, name');
    
    if (insertedCenters.error) {
      console.error('Error fetching centers:', insertedCenters.error);
      return;
    }
    
    // Sample clinics mapped to centers
    const clinics = [];
    
    // Clinics for King Fahd Hospital
    const kingFahdCenter = insertedCenters.data.find(c => c.name === 'مستشفى الملك فهد');
    if (kingFahdCenter) {
      clinics.push(
        { 
          name: 'قسم القلب', 
          center_id: kingFahdCenter.id, 
          description: 'قسم متخصص في أمراض القلب والأوعية الدموية' 
        },
        { 
          name: 'قسم العيون', 
          center_id: kingFahdCenter.id, 
          description: 'قسم متخصص في أمراض العيون وجراحة العيون' 
        },
        { 
          name: 'قسم الأسنان', 
          center_id: kingFahdCenter.id, 
          description: 'قسم متخصص في طب الأسنان وجراحة الفم' 
        },
        { 
          name: 'قسم الجراحة', 
          center_id: kingFahdCenter.id, 
          description: 'قسم الجراحة العامة والجراحة التخصصية' 
        }
      );
    }
    
    // Clinics for Prince Sultan Health Center
    const princeSultanCenter = insertedCenters.data.find(c => c.name === 'مركز الأمير سلطان الصحي');
    if ( princeSultanCenter) {
      clinics.push(
        { 
          name: 'قسم الأطفال', 
          center_id: princeSultanCenter.id, 
          description: 'قسم متخصص في طب الأطفال والأمومة' 
        },
        { 
          name: 'قسم النساء والولادة', 
          center_id: princeSultanCenter.id, 
          description: 'قسم متخصص في طب النساء والولادة' 
        },
        { 
          name: 'قسم الطوارئ', 
          center_id: princeSultanCenter.id, 
          description: 'قسم الطوارئ والرعاية الأولية' 
        }
      );
    }
    
    // Clinics for King Abdulaziz University Hospital
    const kingAbdulazizCenter = insertedCenters.data.find(c => c.name === 'مستشفى الملك عبدالعزيز الجامعي');
    if (kingAbdulazizCenter) {
      clinics.push(
        { 
          name: 'قسم الأشعة', 
          center_id: kingAbdulazizCenter.id, 
          description: 'قسم الأشعة التشخيصية والعلاجية' 
        },
        { 
          name: 'قسم المختبرات', 
          center_id: kingAbdulazizCenter.id, 
          description: 'قسم المختبرات الطبية والتحليلات' 
        },
        { 
          name: 'قسم العلاج الطبيعي', 
          center_id: kingAbdulazizCenter.id, 
          description: 'قسم العلاج الطبيعي وإعادة التأهيل' 
        }
      );
    }
    
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
    
    // Get the inserted clinics with their IDs
    const insertedClinics = await supabase
      .from('clinics')
      .select('id, name, center_id');
    
    if (insertedClinics.error) {
      console.error('Error fetching clinics:', insertedClinics.error);
      return;
    }
    
    // Generate time slots for the next 30 days
    console.log('Generating time slots for the next 30 days...');
    const timeSlots = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Format date as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Generate time slots for each clinic
      for (const clinic of insertedClinics.data) {
        // Morning slots (8:00 AM - 12:00 PM)
        for (let hour = 8; hour < 12; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const startHour = String(hour).padStart(2, '0');
            const startMinute = String(minute).padStart(2, '0');
            const endHour = minute === 30 ? String(hour).padStart(2, '0') : String(hour + 1).padStart(2, '0');
            const endMinute = minute === 30 ? '00' : '30';
            
            timeSlots.push({
              clinic_id: clinic.id,
              date: formattedDate,
              start_time: `${startHour}:${startMinute}:00`,
              end_time: `${endHour}:${endMinute}:00`,
              duration: 30,
              is_available: true
            });
          }
        }
        
        // Afternoon slots (2:00 PM - 6:00 PM)
        for (let hour = 14; hour < 18; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const startHour = String(hour).padStart(2, '0');
            const startMinute = String(minute).padStart(2, '0');
            const endHour = minute === 30 ? String(hour).padStart(2, '0') : String(hour + 1).padStart(2, '0');
            const endMinute = minute === 30 ? '00' : '30';
            
            timeSlots.push({
              clinic_id: clinic.id,
              date: formattedDate,
              start_time: `${startHour}:${startMinute}:00`,
              end_time: `${endHour}:${endMinute}:00`,
              duration: 30,
              is_available: true
            });
          }
        }
      }
    }
    
    // Insert time slots in batches to avoid limits
    console.log(`Inserting ${timeSlots.length} time slots...`);
    const batchSize = 1000;
    for (let i = 0; i < timeSlots.length; i += batchSize) {
      const batch = timeSlots.slice(i, i + batchSize);
      const { error: slotsError } = await supabase
        .from('time_slots')
        .insert(batch);
      
      if (slotsError) {
        console.error(`Error inserting time slots batch ${i / batchSize + 1}:`, slotsError);
        return;
      }
      
      console.log(`Batch ${i / batchSize + 1} of time slots inserted successfully`);
    }
    
    console.log('\n✅ Professional database initialization completed successfully!');
    console.log('Database now contains:');
    console.log(`- ${centersData.length} medical centers`);
    console.log(`- ${clinics.length} clinics`);
    console.log(`- ${timeSlots.length} time slots for the next 30 days`);
    console.log('\nYou can now test the bot with the professional database.');
    
  } catch (error) {
    console.error('❌ Professional database initialization failed:', error.message);
    console.error('Error details:', error);
  }
}

initProfessionalDatabase();