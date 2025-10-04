const { createClient } = require('@supabase/supabase-js');
const { SUPABASE } = require('./config');

/**
 * Admin Panel Service
 * Handles all administrative operations for the medical booking system
 */
class AdminPanelService {
  constructor() {
    // Check if Supabase credentials are provided
    if (!SUPABASE.URL || !SUPABASE.KEY) {
      throw new Error('Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_KEY in your environment variables.');
    }
    
    // Initialize Supabase client with service role key for admin operations
    this.supabase = createClient(SUPABASE.URL, SUPABASE.KEY);
  }

  /**
   * Add a new medical center
   */
  async addMedicalCenter(name, address = null, phone = null) {
    try {
      const { data, error } = await this.supabase
        .from('medical_centers')
        .insert({
          name: name,
          address: address,
          phone: phone,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select();
      
      if (error) {
        throw new Error(`Error adding medical center: ${error.message}`);
      }
      
      return data[0];
    } catch (error) {
      console.error('Error adding medical center:', error);
      throw error;
    }
  }

  /**
   * Add a new clinic to a center
   */
  async addClinic(name, centerName, description = null) {
    try {
      // First get the center ID
      const { data: centerData, error: centerError } = await this.supabase
        .from('medical_centers')
        .select('id')
        .eq('name', centerName)
        .single();
      
      if (centerError) {
        throw new Error(`Error finding center: ${centerError.message}`);
      }
      
      // Add the clinic
      const { data, error } = await this.supabase
        .from('clinics')
        .insert({
          name: name,
          center_id: centerData.id,
          description: description,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select();
      
      if (error) {
        throw new Error(`Error adding clinic: ${error.message}`);
      }
      
      return data[0];
    } catch (error) {
      console.error('Error adding clinic:', error);
      throw error;
    }
  }

  /**
   * Add time slots for a clinic
   */
  async addTimeSlots(clinicName, centerName, date, startTime, endTime, duration = 30) {
    try {
      // Get center ID
      const { data: centerData, error: centerError } = await this.supabase
        .from('medical_centers')
        .select('id')
        .eq('name', centerName)
        .single();
      
      if (centerError) {
        throw new Error(`Error finding center: ${centerError.message}`);
      }
      
      // Get clinic ID
      const { data: clinicData, error: clinicError } = await this.supabase
        .from('clinics')
        .select('id')
        .eq('name', clinicName)
        .eq('center_id', centerData.id)
        .single();
      
      if (clinicError) {
        throw new Error(`Error finding clinic: ${clinicError.message}`);
      }
      
      // Generate time slots
      const slots = this.generateTimeSlots(date, startTime, endTime, duration);
      
      // Add slots to database
      const slotRecords = slots.map(slot => ({
        clinic_id: clinicData.id,
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
        duration: duration,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const { data, error } = await this.supabase
        .from('time_slots')
        .insert(slotRecords)
        .select();
      
      if (error) {
        throw new Error(`Error adding time slots: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error adding time slots:', error);
      throw error;
    }
  }

  /**
   * Generate time slots for a given time range
   */
  generateTimeSlots(date, startTime, endTime, duration) {
    const slots = [];
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + duration * 60000);
      
      if (slotEnd <= end) {
        slots.push({
          date: date,
          startTime: slotStart.toTimeString().substring(0, 5),
          endTime: slotEnd.toTimeString().substring(0, 5)
        });
      }
      
      current = slotEnd;
    }
    
    return slots;
  }

  /**
   * Get all medical centers
   */
  async getAllCenters() {
    try {
      const { data, error } = await this.supabase
        .from('medical_centers')
        .select('id, name, address, phone, created_at')
        .order('name');
      
      if (error) {
        throw new Error(`Error fetching centers: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting centers:', error);
      throw error;
    }
  }

  /**
   * Get all clinics for a center
   */
  async getClinicsForCenter(centerName) {
    try {
      // Get center ID
      const { data: centerData, error: centerError } = await this.supabase
        .from('medical_centers')
        .select('id')
        .eq('name', centerName)
        .single();
      
      if (centerError) {
        throw new Error(`Error finding center: ${centerError.message}`);
      }
      
      // Get clinics
      const { data, error } = await this.supabase
        .from('clinics')
        .select('id, name, description, created_at')
        .eq('center_id', centerData.id)
        .order('name');
      
      if (error) {
        throw new Error(`Error fetching clinics: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting clinics:', error);
      throw error;
    }
  }

  /**
   * Get all time slots for a clinic on a specific date
   */
  async getTimeSlotsForClinic(clinicName, centerName, date) {
    try {
      // Get center ID
      const { data: centerData, error: centerError } = await this.supabase
        .from('medical_centers')
        .select('id')
        .eq('name', centerName)
        .single();
      
      if (centerError) {
        throw new Error(`Error finding center: ${centerError.message}`);
      }
      
      // Get clinic ID
      const { data: clinicData, error: clinicError } = await this.supabase
        .from('clinics')
        .select('id')
        .eq('name', clinicName)
        .eq('center_id', centerData.id)
        .single();
      
      if (clinicError) {
        throw new Error(`Error finding clinic: ${clinicError.message}`);
      }
      
      // Get time slots
      const { data, error } = await this.supabase
        .from('time_slots')
        .select('id, date, start_time, end_time, is_available, created_at')
        .eq('clinic_id', clinicData.id)
        .eq('date', date)
        .order('start_time');
      
      if (error) {
        throw new Error(`Error fetching time slots: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting time slots:', error);
      throw error;
    }
  }

  /**
   * Get all appointments
   */
  async getAllAppointments() {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          patient_age,
          patient_phone,
          status,
          created_at,
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
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }
      
      return data.map(appointment => ({
        id: appointment.id,
        patientName: appointment.patient_name,
        patientAge: appointment.patient_age,
        patientPhone: appointment.patient_phone,
        status: appointment.status,
        center: appointment.time_slots.clinics.medical_centers.name,
        clinic: appointment.time_slots.clinics.name,
        date: appointment.time_slots.date,
        time: `${appointment.time_slots.start_time}-${appointment.time_slots.end_time}`,
        createdAt: appointment.created_at
      }));
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  }

  /**
   * Get appointments for a specific date range
   */
  async getAppointmentsByDateRange(startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          patient_age,
          patient_phone,
          status,
          created_at,
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
        .gte('time_slots.date', startDate)
        .lte('time_slots.date', endDate)
        .order('time_slots.date', { ascending: true })
        .order('time_slots.start_time', { ascending: true });
      
      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }
      
      return data.map(appointment => ({
        id: appointment.id,
        patientName: appointment.patient_name,
        patientAge: appointment.patient_age,
        patientPhone: appointment.patient_phone,
        status: appointment.status,
        center: appointment.time_slots.clinics.medical_centers.name,
        clinic: appointment.time_slots.clinics.name,
        date: appointment.time_slots.date,
        time: `${appointment.time_slots.start_time}-${appointment.time_slots.end_time}`,
        createdAt: appointment.created_at
      }));
    } catch (error) {
      console.error('Error getting appointments by date range:', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId) {
    try {
      // Get appointment details to get slot ID
      const { data: appointmentData, error: appointmentError } = await this.supabase
        .from('appointments')
        .select('slot_id')
        .eq('id', appointmentId)
        .single();
      
      if (appointmentError) {
        throw new Error(`Error finding appointment: ${appointmentError.message}`);
      }
      
      // Update appointment status
      const { data, error } = await this.supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date()
        })
        .eq('id', appointmentId)
        .select();
      
      if (error) {
        throw new Error(`Error cancelling appointment: ${error.message}`);
      }
      
      // Make the time slot available again
      await this.supabase
        .from('time_slots')
        .update({ 
          is_available: true,
          updated_at: new Date()
        })
        .eq('id', appointmentData.slot_id);
      
      return data[0];
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }
}

module.exports = AdminPanelService;