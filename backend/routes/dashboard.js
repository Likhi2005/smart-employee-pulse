const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorizeManager, authorizeEmployee } = require('../middlewares/auth');

const router = express.Router();

// ============================================================
// MANAGER DASHBOARD
// ============================================================
router.get(
    '/manager',
    authenticate,
    authorizeManager,
    dashboardController.getManagerDashboard
);

// ============================================================
// EMPLOYEE DASHBOARD
// ============================================================
router.get(
    '/employee',
    authenticate,
    authorizeEmployee,
    dashboardController.getEmployeeDashboard
);

module.exports = router;