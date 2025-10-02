const cron = require('node-cron');
const { REMINDER_MINUTES_BEFORE, TIMEZONE } = require('./config');
const GoogleSheetsService = require('./googleSheetsService');

/**
 * Bot Handler
 * Manages the conversation flow and user interactions
 */
class BotHandler {
  constructor(bot) {
    this.bot = bot;
    this.sheetsService = new GoogleSheetsService();
    this.userStates = new Map(); // Track user conversation states
    this.pendingConfirmations = new Map(); // Track pending booking confirmations
    this.setupCronJobs(); // Setup reminder jobs
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Handle the initial "حجز" command
    if (text === 'حجز') {
      await this.startBookingProcess(chatId);
      return;
    }
    
    // Show help instructions
    if (text === '/start' || text === '/help') {
      await this.showHelpInstructions(chatId);
      return;
    }
    
    // Handle numeric input for center selection
    const userState = this.userStates.get(chatId);
    if (userState && userState.step === 'SELECTING_CENTER') {
      const centerIndex = parseInt(text);
      if (!isNaN(centerIndex) && centerIndex >= 1 && centerIndex <= userState.centers.length) {
        const selectedCenter = userState.centers[centerIndex - 1];
        await this.handleCenterSelection(chatId, selectedCenter);
        return;
      } else {
        await this.bot.sendMessage(
          chatId,
          '❌ الرجاء إدخال رقم صحيح من قائمة المراكز.'
        );
        return;
      }
    }
    
    // Handle other text messages based on user state
    if (userState) {
      switch (userState.step) {
        case 'SELECTING_CLINIC':
          // Handle numeric input for clinic selection
          const clinicIndex = parseInt(text);
          if (!isNaN(clinicIndex) && clinicIndex >= 1 && clinicIndex <= userState.clinics.length) {
            const selectedClinic = userState.clinics[clinicIndex - 1];
            await this.handleClinicSelection(chatId, userState.center, selectedClinic);
            return;
          } else {
            await this.bot.sendMessage(
              chatId,
              '❌ الرجاء إدخال رقم صحيح من قائمة العيادات.'
            );
            return;
          }
        case 'SELECTING_TIME':
          // Handle numeric input for time selection
          const timeIndex = parseInt(text);
          if (!isNaN(timeIndex) && timeIndex >= 1 && timeIndex <= userState.slots.length) {
            const selectedSlot = userState.slots[timeIndex - 1];
            await this.handleTimeSelection(chatId, selectedSlot.rowIndex, userState.center, userState.clinic);
            return;
          } else {
            await this.bot.sendMessage(
              chatId,
              '❌ الرجاء إدخال رقم صحيح من قائمة الأوقات.'
            );
            return;
          }
        case 'COLLECTING_PATIENT_INFO':
          // Collect patient name
          if (!userState.patientName) {
            // Validate patient name (should not be empty and should be at least 2 characters)
            if (text.trim().length < 2) {
              await this.bot.sendMessage(
                chatId,
                '❌ الرجاء إدخال اسم المريض بشكل صحيح (على الأقل حرفين)'
              );
              return;
            }
            
            // Save patient name and ask for age
            const updatedState = { ...userState, patientName: text.trim() };
            this.userStates.set(chatId, updatedState);
            
            await this.bot.sendMessage(
              chatId,
              '🎂 يرجى إدخال عمر المريض:'
            );
            return;
          }
          
          // Collect patient age
          if (!userState.patientAge) {
            const age = parseInt(text);
            // Validate patient age (should be between 1 and 120)
            if (isNaN(age) || age < 1 || age > 120) {
              await this.bot.sendMessage(
                chatId,
                '❌ الرجاء إدخال عمر المريض بشكل صحيح (رقم بين 1 و 120)'
              );
              return;
            }
            
            // Save patient age and proceed to confirmation
            const updatedState = { ...userState, patientAge: age };
            this.userStates.set(chatId, updatedState);
            
            // Send confirmation message with patient details
            await this.sendBookingConfirmation(chatId, updatedState);
            return;
          }
          break;
        case 'CONFIRMING_BOOKING':
          // Handle booking confirmation
          if (text === 'نعم' || text === 'تأكيد') {
            await this.handleBookingConfirmation(chatId, true);
            return;
          } else if (text === 'لا' || text === 'إلغاء') {
            await this.handleBookingConfirmation(chatId, false);
            return;
          } else {
            await this.bot.sendMessage(
              chatId,
              'الرجاء إرسال "نعم" أو "تأكيد" لتأكيد الحجز، أو "لا" أو "إلغاء" لإلغاء الحجز.'
            );
            return;
          }
      }
    }
    
    // For any other text, prompt user to start booking
    await this.bot.sendMessage(
      chatId, 
      '🩺 مرحباً بك في نظام حجز المواعيد الطبية!\n\nلبدء الحجز، يرجى إرسال كلمة "حجز"\nللحصول على تعليمات الاستخدام، أرسل "/help"'
    );
  }

  /**
   * Show help instructions
   */
  async showHelpInstructions(chatId) {
    const helpMessage = `
🩺 *نظام حجز المواعيد الطبية* 🩺

مرحباً بك في نظام الحجز الذكي للمواعيد الطبية! إليك كيفية استخدام البوت:

📋 *خطوات الحجز*:
1️⃣ أرسل كلمة "حجز" لبدء عملية الحجز
2️⃣ اختر رقم المركز الصحي من القائمة
3️⃣ اختر رقم العيادة من القائمة
4️⃣ اختر رقم الموعد المتاح
5️⃣ أدخل اسم المريض
6️⃣ أدخل عمر المريض
7️⃣ أكد الحجز بإرسال "نعم" أو ألغه بإرسال "لا"

📝 *مثال عملي*:
• إرسال "حجز" لبدء الحجز
• استلام قائمة المراكز: "1. 🏥 مستشفى الملك فهد"
• إرسال "1" لاختيار المركز الأول
• استلام قائمة العيادات: "1. ⚕️ قسم القلب"
• إرسال "1" لاختيار العيادة الأولى
• استلام المواعيد المتاحة: "1. ⏰ 09:00"
• إرسال "1" لاختيار الموعد
• إدخال اسم المريض: "أحمد محمد"
• إدخال عمر المريض: "35"
• تأكيد الحجز بإرسال "نعم"

🆘 *الأوامر المتاحة*:
• /start - عرض هذه التعليمات
• /help - عرض هذه التعليمات
• "حجز" - بدء عملية الحجز الجديدة

⚠️ *ملاحظات مهمة*:
• استخدم الأرقام فقط للاختيار (1, 2, 3, ...)
• جميع المواعيد تكون لليوم التالي
• اسم المريض يجب أن يكون حرفين على الأقل
• عمر المريض يجب أن يكون بين 1 و 120 سنة
• يمكنك إلغاء الحجز في أي وقت بإرسال "لا"
    `;
    
    await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle callback queries (button presses)
   */
  async handleCallbackQuery(query) {
    // Not used in text-based approach
    // All interactions are handled through text messages now
    await this.bot.answerCallbackQuery(query.id);
  }

  /**
   * Start the booking process
   */
  async startBookingProcess(chatId) {
    try {
      // Send welcome message
      await this.bot.sendMessage(
        chatId,
        '🩺 مرحباً بك في نظام حجز المواعيد الطبية!\نيرجى اختيار المركز الصحي:'
      );
      
      // Get medical centers
      const centers = await this.sheetsService.getMedicalCenters();
      
      if (centers.length === 0) {
        await this.bot.sendMessage(
          chatId,
          '❌ عذراً، لا توجد مراكز صحية متاحة حالياً.'
        );
        return;
      }
      
      // Create a numbered list of centers instead of inline keyboard
      let centersList = '📋 الرجاء اختيار رقم المركز من القائمة التالية:\n\n';
      centers.forEach((center, index) => {
        centersList += `${index + 1}. 🏥 ${center}\n`;
      });
      
      // Save centers list and user state
      this.userStates.set(chatId, { 
        step: 'SELECTING_CENTER',
        centers: centers
      });
      
      // Send centers as a numbered list
      await this.bot.sendMessage(
        chatId,
        centersList
      );
    } catch (error) {
      console.error('Error starting booking process:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = '❌ حدث خطأ أثناء تحميل المراكز الصحية. يرجى المحاولة مرة أخرى لاحقاً.';
      
      if (error.message && error.message.includes('Google Sheets credentials not found')) {
        errorMessage = '⚙️ خطأ في التكوين: لم يتم العثور على بيانات اعتماد Google Sheets. يرجى التحقق من إعدادات البوت.';
      } else if (error.code === 404) {
        errorMessage = '⚙️ خطأ في التكوين: لم يتم العثور على جدول البيانات. يرجى التحقق من معرف جدول البيانات.';
      } else if (error.code === 403) {
        errorMessage = '⚙️ خطأ في التكوين: لا توجد صلاحيات للوصول إلى جدول البيانات. يرجى التحقق من إعدادات الوصول.';
      } else if (error.message && error.message.includes('The caller does not have permission')) {
        errorMessage = '⚙️ خطأ في التكوين: لا توجد صلاحيات للوصول إلى جدول البيانات. يرجى التحقق من إعدادات الوصول.';
      }
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  /**
   * Handle center selection
   */
  async handleCenterSelection(chatId, centerName) {
    try {
      console.log(`User ${chatId} selected center: ${centerName}`);
      
      // Handle back button (not used in text-based approach)
      if (centerName === 'back') {
        await this.startBookingProcess(chatId);
        return;
      }
      
      // Get clinics for the selected center
      console.log(`Fetching clinics for center: ${centerName}`);
      const clinics = await this.sheetsService.getClinicsForCenter(centerName);
      console.log(`Found ${clinics.length} clinics for center ${centerName}:`, clinics);
      
      if (clinics.length === 0) {
        console.log(`No clinics found for center: ${centerName}`);
        await this.bot.sendMessage(
          chatId,
          `❌ عذراً، لا توجد عيادات في مركز ${centerName}. يرجى اختيار مركز آخر.`
        );
        
        // Restart the process
        await this.startBookingProcess(chatId);
        return;
      }
      
      // Create a numbered list of clinics
      let clinicsList = `📋 الرجاء اختيار رقم العيادة من قائمة عيادات مركز ${centerName}:\n\n`;
      clinics.forEach((clinic, index) => {
        clinicsList += `${index + 1}. ⚕️ ${clinic}\n`;
      });
      
      // Update user state with clinics list
      const userState = this.userStates.get(chatId) || {};
      this.userStates.set(chatId, { 
        ...userState,
        step: 'SELECTING_CLINIC',
        center: centerName,
        clinics: clinics
      });
      
      // Send clinics as a numbered list
      await this.bot.sendMessage(
        chatId,
        clinicsList
      );
    } catch (error) {
      console.error('Error handling center selection:', error);
      let errorMessage = '❌ حدث خطأ أثناء تحميل العيادات. يرجى المحاولة مرة أخرى لاحقاً.';
      
      // Provide more specific error messages
      if (error.message && error.message.includes('Spreadsheet not found')) {
        errorMessage = '⚙️ خطأ في التكوين: لم يتم العثور على جدول البيانات. يرجى التحقق من إعدادات البوت.';
      } else if (error.message && error.message.includes('Access denied')) {
        errorMessage = '⚙️ خطأ في التكوين: لا توجد صلاحيات للوصول إلى جدول البيانات. يرجى التحقق من إعدادات الوصول.';
      }
      
      await this.bot.sendMessage(
        chatId,
        errorMessage
      );
    }
  }

  /**
   * Handle clinic selection
   */
  async handleClinicSelection(chatId, centerName, clinicName) {
    try {
      console.log(`User ${chatId} selected clinic: ${clinicName} at center: ${centerName}`);
      
      // Handle back button (not used in text-based approach)
      if (clinicName === 'back') {
        await this.handleCenterSelection(chatId, centerName);
        return;
      }
      
      // Get available time slots for tomorrow
      console.log(`Fetching time slots for clinic: ${clinicName} at center: ${centerName}`);
      const slots = await this.sheetsService.getAvailableSlotsForTomorrow(
        centerName, 
        clinicName
      );
      console.log(`Found ${slots.length} time slots for clinic ${clinicName}:`, slots);
      
      if (slots.length === 0) {
        console.log(`No time slots found for clinic: ${clinicName} at center: ${centerName}`);
        await this.bot.sendMessage(
          chatId,
          '❌ عذراً، لا توجد مواعيد متاحة غداً في هذه العيادة.'
        );
        
        // Go back to clinic selection
        await this.handleCenterSelection(chatId, centerName);
        return;
      }
      
      // Create a numbered list of time slots
      let slotsList = `📋 الرجاء اختيار رقم الوقت المتاح في عيادة ${clinicName} غداً:\n\n`;
      slots.forEach((slot, index) => {
        slotsList += `${index + 1}. ⏰ ${slot.time}\n`;
      });
      
      // Update user state with slots list
      const userState = this.userStates.get(chatId) || {};
      this.userStates.set(chatId, { 
        ...userState,
        step: 'SELECTING_TIME',
        center: centerName,
        clinic: clinicName,
        slots: slots
      });
      
      // Send time slots as a numbered list
      await this.bot.sendMessage(
        chatId,
        slotsList
      );
    } catch (error) {
      console.error('Error handling clinic selection:', error);
      let errorMessage = '❌ حدث خطأ أثناء تحميل المواعيد المتاحة. يرجى المحاولة مرة أخرى لاحقاً.';
      
      // Provide more specific error messages
      if (error.message && error.message.includes('Spreadsheet not found')) {
        errorMessage = '⚙️ خطأ في التكوين: لم يتم العثور على جدول البيانات. يرجى التحقق من إعدادات البوت.';
      } else if (error.message && error.message.includes('Access denied')) {
        errorMessage = '⚙️ خطأ في التكوين: لا توجد صلاحيات للوصول إلى جدول البيانات. يرجى التحقق من إعدادات الوصول.';
      }
      
      await this.bot.sendMessage(
        chatId,
        errorMessage
      );
    }
  }

  /**
   * Handle time selection
   */
  async handleTimeSelection(chatId, rowIndex, centerName, clinicName) {
    try {
      // Get appointment details
      const appointment = await this.sheetsService.getAppointmentDetails(rowIndex);
      
      // Update user state to collect patient information
      this.userStates.set(chatId, { 
        step: 'COLLECTING_PATIENT_INFO',
        rowIndex: rowIndex,
        center: centerName,
        clinic: clinicName,
        date: appointment.date,
        time: appointment.time,
        appointmentDetails: appointment
      });
      
      // Ask for patient name
      await this.bot.sendMessage(
        chatId,
        '📝 يرجى إدخال اسم المريض:'
      );
    } catch (error) {
      console.error('Error handling time selection:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ حدث خطأ أثناء تجهيز تأكيد الحجز. يرجى المحاولة مرة أخرى لاحقاً.'
      );
    }
  }

  /**
   * Send booking confirmation with patient details
   */
  async sendBookingConfirmation(chatId, bookingData) {
    const { 
      rowIndex, 
      center, 
      clinic, 
      date, 
      time, 
      patientName, 
      patientAge 
    } = bookingData;
    
    // Update user state
    this.userStates.set(chatId, { 
      ...bookingData,
      step: 'CONFIRMING_BOOKING'
    });
    
    // Send confirmation message with patient details
    await this.bot.sendMessage(
      chatId,
      `📋 *تأكيد الحجز*\n\n` +
      `🏢 المركز: ${center}\n` +
      `⚕️ العيادة: ${clinic}\n` +
      `📅 التاريخ: ${date}\n` +
      `⏰ الوقت: ${time}\n` +
      `👤 اسم المريض: ${patientName}\n` +
      `🎂 عمر المريض: ${patientAge} سنوات\n\n` +
      `لتأكيد الحجز، أرسل "نعم" أو "تأكيد"\n` +
      `لإلغاء الحجز، أرسل "لا" أو "إلغاء"`,
      { parse_mode: 'Markdown' }
    );
  }

  /**
   * Handle booking confirmation
   */
  async handleBookingConfirmation(chatId, confirmed) {
    try {
      if (!confirmed) {
        // User cancelled the booking
        const userState = this.userStates.get(chatId);
        this.userStates.delete(chatId);
        this.pendingConfirmations.delete(chatId);
        
        await this.bot.sendMessage(
          chatId,
          '❌ تم إلغاء الحجز. يمكنك بدء حجز جديد بإرسال كلمة "حجز".'
        );
        return;
      }
      
      // Get pending confirmation data
      const confirmationData = this.userStates.get(chatId);
      if (!confirmationData) {
        await this.bot.sendMessage(
          chatId,
          '❌ عذراً، لم نتمكن من العثور على بيانات الحجز. يرجى المحاولة مرة أخرى.'
        );
        return;
      }
      
      const { 
        rowIndex, 
        center, 
        clinic, 
        date, 
        time, 
        patientName, 
        patientAge 
      } = confirmationData;
      
      // Book the appointment with patient information
      await this.sheetsService.bookAppointment(rowIndex, chatId, patientName, patientAge);
      
      // Clean up user state
      this.userStates.delete(chatId);
      this.pendingConfirmations.delete(chatId);
      
      // Send confirmation message
      await this.bot.sendMessage(
        chatId,
        '✅ *تم تأكيد حجزك بنجاح!*\n\n' +
        `📋 *تفاصيل الحجز:*\n` +
        `🏢 المركز: ${center}\n` +
        `⚕️ العيادة: ${clinic}\n` +
        `📅 التاريخ: ${date}\n` +
        `⏰ الوقت: ${time}\n` +
        `👤 المريض: ${patientName}\n` +
        `🎂 العمر: ${patientAge} سنوات\n\n` +
        'سيتم إرسال تذكير قبل الموعد بساعتين.',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error handling booking confirmation:', error);
      
      // Clean up user state even on error
      this.userStates.delete(chatId);
      this.pendingConfirmations.delete(chatId);
      
      await this.bot.sendMessage(
        chatId,
        '❌ حدث خطأ أثناء تأكيد الحجز. يرجى المحاولة مرة أخرى لاحقاً.'
      );
    }
  }

  /**
   * Setup cron jobs for sending reminders
   */
  setupCronJobs() {
    // Run every minute to check for appointments that need reminders
    cron.schedule('* * * * *', async () => {
      try {
        await this.sendReminders();
      } catch (error) {
        console.error('Error in reminder cron job:', error);
      }
    }, {
      timezone: TIMEZONE
    });
  }

  /**
   * Send reminders for upcoming appointments
   */
  async sendReminders() {
    try {
      // In a real implementation, you would:
      // 1. Query the spreadsheet for appointments in the next 2 hours
      // 2. Check if a reminder has already been sent
      // 3. Send reminders to users
      // 4. Mark reminders as sent in the spreadsheet
      
      // This is a simplified implementation
      console.log('Checking for appointments that need reminders...');
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  }
}

module.exports = BotHandler;