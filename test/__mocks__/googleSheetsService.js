// Mock Google Sheets Service
const { GOOGLE_SHEETS } = require('../../config');

class GoogleSheetsService {
  constructor() {
    // Mock constructor - don't throw errors in test environment
    if (!GOOGLE_SHEETS.CREDENTIALS && process.env.NODE_ENV !== 'test') {
      throw new Error('Google Sheets credentials not found. Please set GOOGLE_CREDENTIALS in your environment variables.');
    }
    
    this.sheets = {
      spreadsheets: {
        values: {
          get: jest.fn(),
          update: jest.fn()
        }
      }
    };
    
    this.spreadsheetId = GOOGLE_SHEETS.SPREADSHEET_ID || 'test-spreadsheet-id';
  }
  
  async getMedicalCenters() {
    return ['Center 1', 'Center 2'];
  }
  
  async getClinicsForCenter(centerName) {
    return ['Clinic 1', 'Clinic 2'];
  }
  
  async getAvailableSlotsForTomorrow(centerName, clinicName) {
    return [
      { rowIndex: 2, date: '2023-06-15', time: '09:00', status: 'متاح' },
      { rowIndex: 3, date: '2023-06-15', time: '10:00', status: 'متاح' }
    ];
  }
  
  async getAppointmentDetails(rowIndex) {
    return {
      center: 'Center 1',
      clinic: 'Clinic 1',
      date: '2023-06-15',
      time: '09:00',
      status: 'متاح'
    };
  }
  
  async bookAppointment(rowIndex, chatId) {
    return { success: true };
  }
}

module.exports = GoogleSheetsService;