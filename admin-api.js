// Admin API Routes for the Medical Booking System

const express = require('express');
const router = express.Router();
const AdminPanelService = require('./admin-panel');
const { ADMIN_CHAT_ID } = require('./config');

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  // In a real implementation, you would check for a valid admin session or token
  // For now, we'll allow access for demonstration purposes
  // You can implement proper authentication using JWT or session-based auth
  
  // Check if ADMIN_CHAT_ID is set and matches (basic check)
  const adminId = req.headers['x-admin-id'] || req.query.adminId;
  if (ADMIN_CHAT_ID && adminId === ADMIN_CHAT_ID) {
    next();
  } else if (!ADMIN_CHAT_ID) {
    // If no ADMIN_CHAT_ID is set, allow access (development mode)
    next();
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized access' });
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