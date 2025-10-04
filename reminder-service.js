const { createClient } = require('@supabase/supabase-js');
const { SUPABASE } = require('./config');
const TelegramBot = require('node-telegram-bot-api');

/**
 * Reminder Service
 * Handles appointment reminders for the medical booking system
 */
class ReminderService {
  constructor(telegramToken) {
    // Check if Supabase credentials are provided
    if (!SUPABASE.URL || !SUPABASE.KEY) {
      throw new Error('Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_KEY in your environment variables.');
    }
    
    // Initialize Supabase client
    this.supabase = createClient(SUPABASE.URL, SUPABASE.KEY);
    
    // Initialize Telegram bot for sending reminders
    this.bot = new TelegramBot(telegramToken);
  }

  /**
   * Check for pending reminders and send them
   */
  async checkAndSendReminders() {
    try {
      console.log('Checking for pending reminders...');
      
      // Get pending reminders that should be sent now
      const now = new Date();
      const { data, error } = await this.supabase
        .from('appointment_reminders')
        .select(`
          id,
          is_sent,
          appointment_id,
          appointments (
            chat_id,
            patient_name,
            time_slots (
              date,
              start_time,
              clinics (
                name,
                medical_centers (
                  name
                )
              )
            )
          )
        `)
        .lte('reminder_time', now.toISOString())
        .eq('is_sent', false);
      
      if (error) {
        throw new Error(`Error fetching reminders: ${error.message}`);
      }
      
      console.log(`Found ${data.length} pending reminders`);
      
      // Send reminders
      for (const reminder of data) {
        try {
          await this.sendReminder(reminder);
          
          // Mark reminder as sent
          await this.markReminderAsSent(reminder.id);
        } catch (sendError) {
          console.error(`Error sending reminder ${reminder.id}:`, sendError);
        }
      }
      
      console.log('Finished checking reminders');
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  /**
   * Send a reminder message to a user
   */
  async sendReminder(reminder) {
    try {
      const chatId = reminder.appointments.chat_id;
      const patientName = reminder.appointments.patient_name;
      const centerName = reminder.appointments.time_slots.clinics.medical_centers.name;
      const clinicName = reminder.appointments.time_slots.clinics.name;
      const appointmentDate = reminder.appointments.time_slots.date;
      const appointmentTime = reminder.appointments.time_slots.start_time;
      
      const reminderMessage = `
🔔 *تذكير بالموعد الطبي*

مرحبًا ${patientName}،

هذا تذكير بموعدك الطبي:

🏥 المركز: ${centerName}
⚕️ العيادة: ${clinicName}
📅 التاريخ: ${appointmentDate}
⏰ الوقت: ${appointmentTime}

موعدك بعد ساعتين تقريبًا. نرجو الحضور في الوقت المحدد.

شُكرًا لاختياركم خدماتنا الطبية.
      `;
      
      await this.bot.sendMessage(chatId, reminderMessage, { parse_mode: 'Markdown' });
      
      console.log(`Reminder sent to chat ${chatId} for appointment at ${appointmentDate} ${appointmentTime}`);
    } catch (error) {
      console.error('Error sending reminder message:', error);
      throw error;
    }
  }

  /**
   * Mark a reminder as sent
   */
  async markReminderAsSent(reminderId) {
    try {
      const { error } = await this.supabase
        .from('appointment_reminders')
        .update({ 
          is_sent: true,
          sent_at: new Date()
        })
        .eq('id', reminderId);
      
      if (error) {
        throw new Error(`Error updating reminder: ${error.message}`);
      }
      
      console.log(`Reminder ${reminderId} marked as sent`);
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
      throw error;
    }
  }

  /**
   * Get all pending reminders
   */
  async getPendingReminders() {
    try {
      const { data, error } = await this.supabase
        .from('appointment_reminders')
        .select(`
          id,
          reminder_time,
          is_sent,
          sent_at,
          appointments (
            id,
            patient_name,
            chat_id,
            time_slots (
              date,
              start_time,
              clinics (
                name,
                medical_centers (
                  name
                )
              )
            )
          )
        `)
        .eq('is_sent', false)
        .order('reminder_time');
      
      if (error) {
        throw new Error(`Error fetching pending reminders: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting pending reminders:', error);
      throw error;
    }
  }

  /**
   * Get sent reminders
   */
  async getSentReminders() {
    try {
      const { data, error } = await this.supabase
        .from('appointment_reminders')
        .select(`
          id,
          reminder_time,
          is_sent,
          sent_at,
          appointments (
            id,
            patient_name,
            chat_id,
            time_slots (
              date,
              start_time,
              clinics (
                name,
                medical_centers (
                  name
                )
              )
            )
          )
        `)
        .eq('is_sent', true)
        .order('sent_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error fetching sent reminders: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting sent reminders:', error);
      throw error;
    }
  }
}

module.exports = ReminderService;