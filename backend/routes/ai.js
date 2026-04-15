const express = require('express');
const { param } = require('express-validator');
const aiService = require('../services/aiService');
const { authenticate, authorizeManager } = require('../middlewares/auth');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ============================================================
// 1. DETECT TASK PRIORITY
// ============================================================
router.post(
    '/detect-priority',
    authenticate,
    authorizeManager,
    async (req, res) => {
        try {
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({ message: 'Task title required' });
            }

            const result = await aiService.detectTaskPriority(title, description || '');

            res.json({
                message: 'Priority detected',
                result,
            });
        } catch (error) {
            console.error('Error detecting priority:', error);
            res.status(500).json({
                message: 'Error detecting priority',
                error: error.message,
            });
        }
    }
);

// ============================================================
// 2. SMART TASK ASSIGNMENT
// ============================================================
router.post(
    '/smart-assign/:taskId',
    authenticate,
    authorizeManager,
    [param('taskId').notEmpty().withMessage('Task ID required')],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { taskId } = req.params;
            const companyId = req.user.companyId;

            const result = await aiService.smartAssignTask(taskId, companyId);

            if (result.success) {
                res.json({
                    message: 'Smart assignment recommendation received',
                    recommendation: result,
                });
            } else {
                res.status(400).json({
                    message: 'Smart assignment failed',
                    reason: result.reason,
                });
            }
        } catch (error) {
            console.error('Error in smart assignment:', error);
            res.status(500).json({
                message: 'Error during smart assignment',
                error: error.message,
            });
        }
    }
);

// ============================================================
// 3. TASK BREAKDOWN
// ============================================================
router.post(
    '/break-down-task',
    authenticate,
    authorizeManager,
    async (req, res) => {
        try {
            const { title, description, effort } = req.body;

            if (!title || !effort) {
                return res.status(400).json({ message: 'Title and effort required' });
            }

            const result = await aiService.generateTaskBreakdown(title, description || '', effort);

            res.json({
                message: 'Task breakdown generated',
                breakdown: result,
            });
        } catch (error) {
            console.error('Error generating breakdown:', error);
            res.status(500).json({
                message: 'Error generating breakdown',
                error: error.message,
            });
        }
    }
);

// ============================================================
// 4. PERFORMANCE INSIGHTS
// ============================================================
router.get(
    '/performance-insights',
    authenticate,
    authorizeManager,
    async (req, res) => {
        try {
            const companyId = req.user.companyId;

            const insights = await aiService.generatePerformanceInsights(companyId);

            res.json({
                message: 'Performance insights generated',
                insights,
            });
        } catch (error) {
            console.error('Error generating insights:', error);
            res.status(500).json({
                message: 'Error generating insights',
                error: error.message,
            });
        }
    }
);

module.exports = router;