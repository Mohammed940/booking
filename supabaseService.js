const { createClient } = require('@supabase/supabase-js');
const { SUPABASE } = require('./config');

/**
 * Supabase Service
 * Handles all interactions with Supabase database
 */
class SupabaseService {
  constructor() {
    // Check if Supabase credentials are provided
    if (!SUPABASE.URL || !SUPABASE.KEY || 
        SUPABASE.URL === 'YOUR_SUPABASE_PROJECT_URL_HERE' || 
        SUPABASE.KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
      throw new Error('Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_KEY in your environment variables.');
    }
    
    try {
      // Initialize Supabase client
      this.supabase = createClient(SUPABASE.URL, SUPABASE.KEY);
      
      // Initialize cache
      this.cache = {
        centers: null,
        centersTimestamp: 0,
        clinics: new Map(), // Cache clinics by center
        clinicsTimestamps: new Map(),
        slots: new Map() // Cache slots by center+clinic
      };
      
      // Cache expiration time (1 minute for better responsiveness)
      this.CACHE_EXPIRATION = 1 * 60 * 1000;
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      throw new Error('Failed to initialize Supabase client. Please check your credentials.');
    }
  }

  /**
   * Check if cache is expired
   */
  isCacheExpired(timestamp) {
    return Date.now() - timestamp > this.CACHE_EXPIRATION;
  }

  /**
   * Get all medical centers from the database
   */
  async getMedicalCenters() {
    try {
      // If cache is still valid, return cached data
      if (this.cache.centers && !this.isCacheExpired(this.cache.centersTimestamp)) {
        return this.cache.centers;
      }
      
      console.log('Loading centers data from Supabase...');
      
      // Fetch centers from database
      const { data, error } = await this.supabase
        .from('medical_centers')
        .select('id, name')
        .order('name');
      
      if (error) {
        throw new Error(`Error fetching centers: ${error.message}`);
      }
      
      // Extract center names
      const centers = data.map(center => center.name);
      
      // Update cache
      this.cache.centers = centers;
      this.cache.centersTimestamp = Date.now();
      
      return centers;
    } catch (error) {
      console.error('Error getting medical centers:', error);
      throw error;
    }
  }

  /**
   * Get clinics for a specific medical center
   */
  async getClinicsForCenter(centerName) {
    try {
      // Check if we have cached data for this center
      const cachedClinics = this.cache.clinics.get(centerName);
      const timestamp = this.cache.clinicsTimestamps.get(centerName);
      
      if (cachedClinics && timestamp && !this.isCacheExpired(timestamp)) {
        return [...cachedClinics];
      }
      
      console.log(`Loading clinics for center: ${centerName}`);
      
      // First get the center ID
      const { data: centerData, error: centerError } = await this.supabase
        .from('medical_centers')
        .select('id')
        .eq('name', centerName)
        .single();
      
      if (centerError) {
        throw new Error(`Error fetching center: ${centerError.message}`);
      }
      
      // Fetch clinics for this center
      const { data, error } = await this.supabase
        .from('clinics')
        .select('id, name')
        .eq('center_id', centerData.id)
        .order('name');
      
      if (error) {
        throw new Error(`Error fetching clinics: ${error.message}`);
      }
      
      // Extract clinic names
      const clinics = data.map(clinic => clinic.name);
      
      // Update cache
      this.cache.clinics.set(centerName, clinics);
      this.cache.clinicsTimestamps.set(centerName, Date.now());
      
      return clinics;
    } catch (error) {
      console.error('Error getting clinics:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for tomorrow for a specific center and clinic
   */
  async getAvailableSlotsForTomorrow(centerName, clinicName) {
    try {
      console.log(`Fetching time slots for center: ${centerName}, clinic: ${clinicName}`);
      
      // Create cache key
      const cacheKey = `${centerName}|${clinicName}`;
      const tomorrow = this.getTomorrowDate();
      
      // Check if we have cached data for this center+clinic combination
      const cachedSlots = this.cache.slots.get(cacheKey);
      if (cachedSlots && !this.isCacheExpired(cachedSlots.timestamp)) {
        // Filter for tomorrow's date
        return cachedSlots.data.filter(slot => slot.date === tomorrow);
      }
      
      // Get center ID
      const { data: centerData, error: centerError } = await this.supabase
        .from('medical_centers')
        .select('id')
        .eq('name', centerName)
        .single();
      
      if (centerError) {
        throw new Error(`Error fetching center: ${centerError.message}`);
      }
      
      // Get clinic ID
      const { data: clinicData, error: clinicError } = await this.supabase
        .from('clinics')
        .select('id')
        .eq('name', clinicName)
        .eq('center_id', centerData.id)
        .single();
      
      if (clinicError) {
        throw new Error(`Error fetching clinic: ${clinicError.message}`);
      }
      
      // Fetch available slots for tomorrow
      const { data, error } = await this.supabase
        .from('time_slots')
        .select('id, date, start_time, end_time')
        .eq('clinic_id', clinicData.id)
        .eq('date', tomorrow)
        .eq('is_available', true)
        .order('start_time');
      
      if (error) {
        throw new Error(`Error fetching slots: ${error.message}`);
      }
      
      // Transform data to match expected format
      const availableSlots = data.map(slot => ({
        rowIndex: slot.id,
        date: slot.date,
        time: `${slot.start_time}-${slot.end_time}`,
        status: 'متاح'
      }));
      
      // Cache the results
      this.cache.slots.set(cacheKey, {
        data: availableSlots,
        timestamp: Date.now()
      });
      
      console.log(`Found ${availableSlots.length} available slots`);
      return availableSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Book an appointment by creating a new appointment record
   */
  async bookAppointment(slotId, chatId, patientName, patientAge) {
    try {
      // Invalidate cache when booking is made
      this.invalidateCache();
      
      // Create the appointment
      const { data, error } = await this.supabase
        .from('appointments')
        .insert({
          slot_id: slotId,
          patient_name: patientName,
          patient_age: patientAge,
          chat_id: chatId,
          status: 'confirmed',
          created_at: new Date(),
          updated_at: new Date()
        })
        .select();
      
      if (error) {
        throw new Error(`Error booking appointment: ${error.message}`);
      }
      
      // Update the slot to be unavailable
      await this.supabase
        .from('time_slots')
        .update({ is_available: false, updated_at: new Date() })
        .eq('id', slotId);
      
      // Create reminder for 2 hours before appointment
      const appointmentId = data[0].id;
      await this.createAppointmentReminder(appointmentId, slotId);
      
      return data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  /**
   * Create appointment reminder for 2 hours before appointment
   */
  async createAppointmentReminder(appointmentId, slotId) {
    try {
      // Get slot details
      const { data: slotData, error: slotError } = await this.supabase
        .from('time_slots')
        .select('date, start_time')
        .eq('id', slotId)
        .single();
      
      if (slotError) {
        throw new Error(`Error fetching slot: ${slotError.message}`);
      }
      
      // Calculate reminder time (2 hours before appointment)
      const appointmentDateTime = new Date(`${slotData.date}T${slotData.start_time}`);
      const reminderTime = new Date(appointmentDateTime.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
      
      // Create reminder record
      const { data, error } = await this.supabase
        .from('appointment_reminders')
        .insert({
          appointment_id: appointmentId,
          reminder_time: reminderTime,
          is_sent: false,
          created_at: new Date()
        })
        .select();
      
      if (error) {
        throw new Error(`Error creating reminder: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating appointment reminder:', error);
      throw error;
    }
  }

  /**
   * Get appointment details by ID
   */
  async getAppointmentDetails(appointmentId) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          patient_age,
          status,
          chat_id,
          time_slots (
            date,
            start_time,
            end_time,
            clinics (
              name,
              medical_centers (
                name
              )
            )
          )
        `)
        .eq('id', appointmentId)
        .single();
      
      if (error) {
        throw new Error(`Error fetching appointment: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Appointment not found');
      }
      
      return {
        id: data.id,
        center: data.time_slots.clinics.medical_centers.name,
        clinic: data.time_slots.clinics.name,
        date: data.time_slots.date,
        time: `${data.time_slots.start_time}-${data.time_slots.end_time}`,
        status: data.status,
        chatId: data.chat_id,
        patientName: data.patient_name,
        patientAge: data.patient_age
      };
    } catch (error) {
      console.error('Error getting appointment details:', error);
      throw error;
    }
  }

  /**
   * Get all booked appointments for a specific chat ID
   */
  async getUserAppointments(chatId) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          patient_age,
          status,
          time_slots (
            date,
            start_time,
            end_time,
            clinics (
              name,
              medical_centers (
                name
              )
            )
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error fetching user appointments: ${error.message}`);
      }
      
      return data.map(appointment => ({
        id: appointment.id,
        center: appointment.time_slots.clinics.medical_centers.name,
        clinic: appointment.time_slots.clinics.name,
        date: appointment.time_slots.date,
        time: `${appointment.time_slots.start_time}-${appointment.time_slots.end_time}`,
        status: appointment.status,
        patientName: appointment.patient_name,
        patientAge: appointment.patient_age
      }));
    } catch (error) {
      console.error('Error getting user appointments:', error);
      throw error;
    }
  }

  /**
   * Get tomorrow's date in YYYY-MM-DD format to match database format
   */
  getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format as YYYY-MM-DD for database
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  }

  /**
   * Invalidate cache when data changes
   */
  invalidateCache() {
    this.cache.centers = null;
    this.cache.centersTimestamp = 0;
    this.cache.clinics.clear();
    this.cache.clinicsTimestamps.clear();
    this.cache.slots.clear();
  }
}

module.exports = SupabaseService;