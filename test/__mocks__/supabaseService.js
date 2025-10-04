// Mock Supabase Service for testing

class MockSupabaseService {
  constructor() {
    // Mock data
    this.centers = ['مستشفى الملك فهد', 'مركز الأمير سلطان الصحي', 'مستشفى الملك عبدالعزيز الجامعي'];
    this.clinics = {
      'مستشفى الملك فهد': ['قسم القلب', 'قسم العيون', 'قسم الأسنان', 'قسم الجراحة'],
      'مركز الأمير سلطان الصحي': ['قسم الأطفال', 'قسم النساء والولادة', 'قسم الطوارئ'],
      'مستشفى الملك عبدالعزيز الجامعي': ['قسم الأشعة', 'قسم المختبرات', 'قسم العلاج الطبيعي']
    };
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const year = tomorrow.getFullYear();
    const tomorrowDate = `${day}/${month}/${year}`;
    
    this.slots = [
      { rowIndex: 1, date: tomorrowDate, time: '09:00', status: 'متاح' },
      { rowIndex: 2, date: tomorrowDate, time: '10:30', status: 'متاح' },
      { rowIndex: 3, date: tomorrowDate, time: '14:00', status: 'متاح' }
    ];
  }

  async getMedicalCenters() {
    return this.centers;
  }

  async getClinicsForCenter(centerName) {
    return this.clinics[centerName] || [];
  }

  async getAvailableSlotsForTomorrow(centerName, clinicName) {
    return this.slots;
  }

  async bookAppointment(rowId, chatId, patientName, patientAge) {
    return { success: true };
  }

  getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const year = tomorrow.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

module.exports = MockSupabaseService;