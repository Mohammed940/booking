// Admin API Routes for the Medical Booking System

const express = require('express');
const router = express.Router();
const AdminPanelService = require('./admin-panel');
const { ADMIN_CHAT_ID } = require('./config');

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  // Check if ADMIN_CHAT_ID is set and matches (basic check)
  const adminId = req.headers['x-admin-id'] || req.query.adminId;
  
  // If ADMIN_CHAT_ID is set in config, it must match the provided adminId
  if (ADMIN_CHAT_ID) {
    if (adminId === ADMIN_CHAT_ID) {
      next();
    } else {
      res.status(401).json({ success: false, error: 'Unauthorized access' });
    }
  } else if (adminId) {
    // If no ADMIN_CHAT_ID is set in config but adminId is provided, allow access
    // This is useful for development/testing but should be avoided in production
    console.warn('ADMIN_CHAT_ID not set in config - allowing access with provided adminId (INSECURE)');
    next();
  } else {
    // If neither ADMIN_CHAT_ID is set in config nor adminId is provided
    console.warn('ADMIN_CHAT_ID not set and no adminId provided - allowing all admin access (INSECURE)');
    next();
  }
};

// Apply authentication middleware to all admin routes
router.use(authenticateAdmin);

// Initialize admin panel service
const adminPanel = new AdminPanelService();

// Add medical center
router.post('/centers', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const center = await adminPanel.addMedicalCenter(name, address, phone);
    res.status(201).json({ success: true, data: center });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add clinic
router.post('/clinics', async (req, res) => {
  try {
    const { name, centerName, description } = req.body;
    const clinic = await adminPanel.addClinic(name, centerName, description);
    res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add time slots
router.post('/slots', async (req, res) => {
  try {
    const { clinicName, centerName, date, startTime, endTime, duration } = req.body;
    const slots = await adminPanel.addTimeSlots(clinicName, centerName, date, startTime, endTime, duration || 30);
    res.status(201).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all centers
router.get('/centers', async (req, res) => {
  try {
    const centers = await adminPanel.getAllCenters();
    res.status(200).json({ success: true, data: centers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get clinics for center
router.get('/clinics/:centerName', async (req, res) => {
  try {
    const { centerName } = req.params;
    const clinics = await adminPanel.getClinicsForCenter(centerName);
    res.status(200).json({ success: true, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get time slots for clinic
router.get('/slots/:centerName/:clinicName/:date', async (req, res) => {
  try {
    const { centerName, clinicName, date } = req.params;
    const slots = await adminPanel.getTimeSlotsForClinic(clinicName, centerName, date);
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await adminPanel.getAllAppointments();
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get appointments by date range
router.get('/appointments/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const appointments = await adminPanel.getAppointmentsByDateRange(startDate, endDate);
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel appointment
router.post('/appointments/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await adminPanel.cancelAppointment(id);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;