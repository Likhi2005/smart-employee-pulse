const express = require('express');
const workloadController = require('../controllers/workloadController');
const { authenticate, authorizeManager } = require('../middlewares/auth');

const router = express.Router();

// All workload routes require manager authentication
router.use(authenticate, authorizeManager);

// ============================================================
// WORKLOAD SUMMARY
// ============================================================
router.get('/summary', workloadController.getWorkloadSummary);

// ============================================================
// WORKLOAD BY TEAM
// ============================================================
router.get('/by-team', workloadController.getWorkloadByTeam);

// ============================================================
// WORKLOAD ANALYTICS
// ============================================================
router.get('/analytics', workloadController.getWorkloadAnalytics);

// ============================================================
// EMPLOYEE DRILL-DOWN
// ============================================================
router.get('/employee/:employeeId', workloadController.getEmployeeWorkloadDetails);

// ============================================================
// WORKLOAD TRENDS (Time series)
// ============================================================
router.get('/trends', workloadController.getWorkloadTrends);

module.exports = router;
