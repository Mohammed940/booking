const { google } = require('googleapis');
const { GOOGLE_SHEETS, TIMEZONE } = require('./config');

/**
 * Google Sheets Service
 * Handles all interactions with Google Sheets API
 */
class GoogleSheetsService {
  constructor() {
    // Check if credentials are provided
    if (!GOOGLE_SHEETS.CREDENTIALS) {
      console.warn('Google Sheets credentials not found. Google Sheets integration will be disabled.');
      this.disabled = true;
      return;
    }
    
    // Check if spreadsheet ID is provided
    if (!GOOGLE_SHEETS.SPREADSHEET_ID || GOOGLE_SHEETS.SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
      throw new Error('Google Sheets spreadsheet ID not found. Please set SPREADSHEET_ID in your environment variables.');
    }
    
    try {
      // Initialize Google Sheets client
      const auth = new google.auth.GoogleAuth({
        credentials: GOOGLE_SHEETS.CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      this.sheets = google.sheets({ version: 'v4', auth });
      this.spreadsheetId = GOOGLE_SHEETS.SPREADSHEET_ID;
    } catch (error) {
      console.error('Error initializing Google Sheets client:', error);
      throw new Error('Failed to initialize Google Sheets client. Please check your credentials.');
    }
  }

  /**
   * Get all medical centers from the spreadsheet
   * Assumes centers are in column A of the first sheet
   */
  async getMedicalCenters() {
    // If Google Sheets is disabled, return sample data
    if (this.disabled) {
      console.warn('Google Sheets is disabled. Returning sample data.');
      return ['مستشفى الملك فهد', 'مركز الأمير سلطان الصحي', 'مستشفى الملك عبدالعزيز الجامعي'];
    }
    
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A2:A', // Skip header row
      });
      
      const rows = response.data.values || [];
      const centers = [...new Set(rows.flat())].filter(center => center); // Unique, non-empty centers
      
      return centers;
    } catch (error) {
      console.error('Error getting medical centers:', error);
      
      // Re-throw with a more descriptive message
      if (error.code === 404) {
        throw new Error('Spreadsheet not found. Please check your SPREADSHEET_ID configuration.');
      } else if (error.code === 403) {
        throw new Error('Access denied to spreadsheet. Please check your Google Sheets credentials and sharing settings.');
      } else if (error.message && error.message.includes('The caller does not have permission')) {
        throw new Error('Insufficient permissions to access spreadsheet. Please check your Google Sheets credentials and sharing settings.');
      }
      
      throw error;
    }
  }

  /**
   * Get clinics for a specific medical center
   * Assumes data is structured with Center in column A, Clinic in column B
   */
  async getClinicsForCenter(centerName) {
    // If Google Sheets is disabled, return sample data
    if (this.disabled) {
      console.warn('Google Sheets is disabled. Returning sample data.');
      return ['قسم القلب', 'قسم العيون', 'قسم الأسنان', 'قسم الجراحة'];
    }
    
    try {
      console.log(`Fetching clinics for center: ${centerName}`);
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:B', // Get columns A, B (Center, Clinic)
      });
      
      console.log('Google Sheets response:', response.data);
      const rows = response.data.values || [];
      const clinics = new Set();
      
      // Skip header row (index 0) and filter rows matching the center
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] === centerName) { // Center matches
          clinics.add(row[1]); // Add clinic name (column B)
        }
      }
      
      const result = [...clinics];
      console.log(`Found clinics for ${centerName}:`, result);
      return result;
    } catch (error) {
      console.error('Error getting clinics:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for tomorrow for a specific center and clinic
   * Assumes data structure: Center (A), Clinic (B), Date (C), Time (D), Status (E), Chat ID (F)
   */
  async getAvailableSlotsForTomorrow(centerName, clinicName) {
    // If Google Sheets is disabled, return sample data
    if (this.disabled) {
      console.warn('Google Sheets is disabled. Returning sample data.');
      return [
        { rowIndex: 2, date: this.getTomorrowDate(), time: '09:00', status: 'متاح' },
        { rowIndex: 3, date: this.getTomorrowDate(), time: '10:30', status: 'متاح' },
        { rowIndex: 4, date: this.getTomorrowDate(), time: '14:00', status: 'متاح' }
      ];
    }
    
    try {
      console.log(`Fetching time slots for center: ${centerName}, clinic: ${clinicName}`);
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:F', // Get all relevant columns
      });
      
      const rows = response.data.values || [];
      const tomorrow = this.getTomorrowDate();
      console.log(`Looking for appointments for tomorrow's date: ${tomorrow}`);
      const availableSlots = [];
      
      // Skip header row and filter for matching center, clinic, tomorrow's date, and available status
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        console.log(`Checking row ${i}:`, row);
        
        // Check if row matches criteria: center, clinic, tomorrow's date, and not booked
        if (row[0] === centerName && 
            row[1] === clinicName && 
            row[2] === tomorrow && 
            row[4] !== 'محجوز') {
          
          console.log(`Found matching slot at row ${i}:`, {
            center: row[0],
            clinic: row[1],
            date: row[2],
            time: row[3],
            status: row[4]
          });
          
          availableSlots.push({
            rowIndex: i + 1, // 1-indexed for Google Sheets
            date: row[2],
            time: row[3],
            status: row[4] || 'متاح' // Default to 'متاح' if empty
          });
        }
      }
      
      console.log(`Found ${availableSlots.length} available slots`);
      return availableSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Book an appointment by updating the status and storing user's chat ID
   */
  async bookAppointment(rowIndex, chatId, patientName, patientAge) {
    // If Google Sheets is disabled, just log the booking
    if (this.disabled) {
      console.warn('Google Sheets is disabled. Booking not saved to spreadsheet.');
      return { success: true, message: 'Booking simulated successfully' };
    }
    
    try {
      // Update the row with booking status, chat ID, patient name, and patient age
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `E${rowIndex}:H${rowIndex}`, // Update Status, Chat ID, Patient Name, and Patient Age columns
        valueInputOption: 'RAW',
        resource: {
          values: [['محجوز', chatId, patientName, patientAge]] // Status, Chat ID, Patient Name, Patient Age
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  /**
   * Get appointment details by row index
   */
  async getAppointmentDetails(rowIndex) {
    // If Google Sheets is disabled, return sample data
    if (this.disabled) {
      console.warn('Google Sheets is disabled. Returning sample data.');
      return {
        center: 'مستشفى الملك فهد',
        clinic: 'قسم القلب',
        date: this.getTomorrowDate(),
        time: '09:00',
        status: 'محجوز',
        chatId: 'sample-chat-id'
      };
    }
    
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `A${rowIndex}:F${rowIndex}`, // Get all appointment data
      });
      
      const rows = response.data.values || [];
      if (rows.length === 0) {
        throw new Error('Appointment not found');
      }
      
      const row = rows[0];
      return {
        center: row[0],
        clinic: row[1],
        date: row[2],
        time: row[3],
        status: row[4],
        chatId: row[5]
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
    // If Google Sheets is disabled, return sample data
    if (this.disabled) {
      console.warn('Google Sheets is disabled. Returning sample data.');
      return [];
    }
    
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:F', // Get all data
      });
      
      const rows = response.data.values || [];
      const appointments = [];
      
      // Skip header row and filter for matching chat ID
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[5] == chatId) { // Chat ID matches (using == for string/number comparison)
          appointments.push({
            rowIndex: i + 1,
            center: row[0],
            clinic: row[1],
            date: row[2],
            time: row[3],
            status: row[4]
          });
        }
      }
      
      return appointments;
    } catch (error) {
      console.error('Error getting user appointments:', error);
      throw error;
    }
  }

  /**
   * Get tomorrow's date in DD/MM/YYYY format to match spreadsheet format
   */
  getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Use local date in DD/MM/YYYY format to match spreadsheet
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = tomorrow.getFullYear();
    
    return `${day}/${month}/${year}`; // DD/MM/YYYY format
  }
}

module.exports = GoogleSheetsService;