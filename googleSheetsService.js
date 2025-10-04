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
      
      // Initialize cache
      this.cache = {
        centers: null,
        centersTimestamp: 0,
        clinics: new Map(), // Cache clinics by center
        clinicsTimestamps: new Map(),
        fullData: null, // Cache all data
        fullDataTimestamp: 0,
        slots: new Map() // Cache slots by center+clinic
      };
      
      // Cache expiration time (2 minutes for Vercel environment)
      this.CACHE_EXPIRATION = 2 * 60 * 1000;
      
      // Flag to track if we're currently loading data
      this.loading = {
        fullData: false,
        centers: false,
        clinics: new Map()
      };
    } catch (error) {
      console.error('Error initializing Google Sheets client:', error);
      throw new Error('Failed to initialize Google Sheets client. Please check your credentials.');
    }
  }

  /**
   * Check if cache is expired
   */
  isCacheExpired(timestamp) {
    return Date.now() - timestamp > this.CACHE_EXPIRATION;
  }

  /**
   * Load all data from spreadsheet into cache
   */
  async loadFullDataIntoCache() {
    if (this.disabled) return;
    
    try {
      // If cache is still valid, return cached data
      if (this.cache.fullData && !this.isCacheExpired(this.cache.fullDataTimestamp)) {
        return this.cache.fullData;
      }
      
      // If we're already loading data, wait for it to complete
      if (this.loading.fullData) {
        // Wait until loading is complete
        while (this.loading.fullData) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        // Return the cached data
        return this.cache.fullData;
      }
      
      // Set loading flag
      this.loading.fullData = true;
      
      console.log('Loading full data from Google Sheets...');
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:F', // Get all relevant columns
      });
      
      const rows = response.data.values || [];
      this.cache.fullData = rows;
      this.cache.fullDataTimestamp = Date.now();
      
      // Also populate centers and clinics cache from this data
      this.populateCentersAndClinicsCache(rows);
      
      // Clear loading flag
      this.loading.fullData = false;
      
      return rows;
    } catch (error) {
      // Clear loading flag on error
      this.loading.fullData = false;
      console.error('Error loading full data into cache:', error);
      throw error;
    }
  }

  /**
   * Load only centers data (more efficient for getting centers only)
   */
  async loadCentersData() {
    if (this.disabled) return;
    
    try {
      // If cache is still valid, return cached data
      if (this.cache.centers && !this.isCacheExpired(this.cache.centersTimestamp)) {
        return this.cache.centers;
      }
      
      // If we're already loading data, wait for it to complete
      if (this.loading.centers) {
        // Wait until loading is complete
        while (this.loading.centers) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        // Return the cached data
        return this.cache.centers;
      }
      
      // Set loading flag
      this.loading.centers = true;
      
      console.log('Loading centers data from Google Sheets...');
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:B', // Get only center and clinic columns
      });
      
      const rows = response.data.values || [];
      
      // Extract unique centers
      const centers = [...new Set(rows.slice(1).map(row => row[0]).filter(center => center))];
      
      // Update cache
      this.cache.centers = centers;
      this.cache.centersTimestamp = Date.now();
      
      // Clear loading flag
      this.loading.centers = false;
      
      return centers;
    } catch (error) {
      // Clear loading flag on error
      this.loading.centers = false;
      console.error('Error loading centers data:', error);
      throw error;
    }
  }

  /**
   * Load clinics for a specific center
   */
  async loadClinicsForCenter(centerName) {
    if (this.disabled) return;
    
    try {
      // Check if we have cached data for this center
      const cachedClinics = this.cache.clinics.get(centerName);
      const timestamp = this.cache.clinicsTimestamps.get(centerName);
      
      if (cachedClinics && timestamp && !this.isCacheExpired(timestamp)) {
        return [...cachedClinics];
      }
      
      // Check if we're already loading data for this center
      if (this.loading.clinics.has(centerName)) {
        // Wait until loading is complete
        while (this.loading.clinics.has(centerName)) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        // Return the cached data
        const cached = this.cache.clinics.get(centerName);
        return cached ? [...cached] : [];
      }
      
      // Set loading flag
      this.loading.clinics.set(centerName, true);
      
      console.log(`Loading clinics for center: ${centerName}`);
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:B', // Get only center and clinic columns
      });
      
      const rows = response.data.values || [];
      
      // Extract clinics for this center
      const clinics = new Set();
      
      // Skip header row (index 0) and process all rows
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] === centerName && row[1]) {
          clinics.add(row[1]);
        }
      }
      
      // Update cache
      this.cache.clinics.set(centerName, clinics);
      this.cache.clinicsTimestamps.set(centerName, Date.now());
      
      // Clear loading flag
      this.loading.clinics.delete(centerName);
      
      return [...clinics];
    } catch (error) {
      // Clear loading flag on error
      this.loading.clinics.delete(centerName);
      console.error(`Error loading clinics for center ${centerName}:`, error);
      throw error;
    }
  }

  /**
   * Populate centers and clinics cache from full data
   */
  populateCentersAndClinicsCache(rows) {
    if (rows.length <= 1) return; // No data or only header row
    
    const centers = new Set();
    const clinicsByCenter = new Map();
    
    // Skip header row (index 0) and process all rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const center = row[0];
      const clinic = row[1];
      
      if (center) {
        centers.add(center);
        
        // Add clinic to center's clinics list
        if (clinic) {
          if (!clinicsByCenter.has(center)) {
            clinicsByCenter.set(center, new Set());
          }
          clinicsByCenter.get(center).add(clinic);
        }
      }
    }
    
    // Update cache
    this.cache.centers = [...centers];
    this.cache.centersTimestamp = Date.now();
    this.cache.clinics = clinicsByCenter;
    // Update timestamps for all clinics
    for (const center of clinicsByCenter.keys()) {
      this.cache.clinicsTimestamps.set(center, Date.now());
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
      // Load only centers data (more efficient)
      const centers = await this.loadCentersData();
      
      return centers || [];
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
      
      // Load clinics for this specific center
      const clinics = await this.loadClinicsForCenter(centerName);
      
      return clinics;
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
      
      // Create cache key
      const cacheKey = `${centerName}|${clinicName}`;
      const tomorrow = this.getTomorrowDate();
      
      // Check if we have cached data for this center+clinic combination
      const cachedSlots = this.cache.slots.get(cacheKey);
      if (cachedSlots && !this.isCacheExpired(cachedSlots.timestamp)) {
        // Filter for tomorrow's date
        return cachedSlots.data.filter(slot => slot.date === tomorrow);
      }
      
      // Fetch data directly for this center and clinic (more efficient)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:F', // Get all relevant columns
      });
      
      const rows = response.data.values || [];
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
   * Book an appointment by updating the status and storing user's chat ID
   */
  async bookAppointment(rowIndex, chatId, patientName, patientAge) {
    // If Google Sheets is disabled, just log the booking
    if (this.disabled) {
      console.warn('Google Sheets is disabled. Booking not saved to spreadsheet.');
      return { success: true, message: 'Booking simulated successfully' };
    }
    
    try {
      // Invalidate cache when booking is made
      this.invalidateCache();
      
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
   * Invalidate cache when data changes
   */
  invalidateCache() {
    this.cache.centers = null;
    this.cache.centersTimestamp = 0;
    this.cache.clinics.clear();
    this.cache.clinicsTimestamps.clear();
    this.cache.fullData = null;
    this.cache.fullDataTimestamp = 0;
    this.cache.slots.clear();
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
      // Load full data into cache (will use cached data if still valid)
      const rows = await this.loadFullDataIntoCache();
      
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