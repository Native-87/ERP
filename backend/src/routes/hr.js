const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');

router.get('/employees', authenticate, hrController.getEmployees);
router.post('/employees', authenticate, authorize('admin'), hrController.createEmployee);
router.put('/employees/:id', authenticate, authorize('admin'), hrController.updateEmployee);

// Attendance
router.get('/attendance', authenticate, hrController.getAttendances);
router.post('/attendance', authenticate, hrController.createAttendance);

// Leaves
router.get('/leaves', authenticate, hrController.getLeaves);
router.post('/leaves', authenticate, hrController.createLeave);

// Payrolls
router.get('/payrolls', authenticate, hrController.getPayrolls);

module.exports = router;
