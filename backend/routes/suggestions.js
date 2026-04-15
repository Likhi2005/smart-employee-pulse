const express = require('express');
const { param } = require('express-validator');
const aiSuggestionService = require('../services/aiSuggestionService');
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
// GET AI SUGGESTION FOR A TASK
// ============================================================
router.get(
    '/task/:taskId',
    authenticate,
    authorizeManager,
    [param('taskId').notEmpty().withMessage('Task ID required')],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { taskId } = req.params;
            const companyId = req.user.companyId;

            const suggestion = await aiSuggestionService.getSuggestionForTask(
                taskId,
                companyId
            );

            res.json({
                message: 'AI suggestion retrieved',
                suggestion,
            });
        } catch (error) {
            console.error('Error getting suggestion:', error);
            res.status(500).json({
                message: 'Error getting AI suggestion',
                error: error.message,
            });
        }
    }
);

// ============================================================
// GET TOP 3 SUGGESTIONS
// ============================================================
router.get(
    '/task/:taskId/top',
    authenticate,
    authorizeManager,
    [param('taskId').notEmpty().withMessage('Task ID required')],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { taskId } = req.params;
            const { count } = req.query;
            const companyId = req.user.companyId;

            const suggestions = await aiSuggestionService.getTopSuggestions(
                taskId,
                companyId,
                count ? parseInt(count) : 3
            );

            res.json({
                message: 'Top AI suggestions retrieved',
                suggestions,
                count: suggestions.length,
            });
        } catch (error) {
            console.error('Error getting top suggestions:', error);
            res.status(500).json({
                message: 'Error getting suggestions',
                error: error.message,
            });
        }
    }
);

// ============================================================
// GET WORKLOAD DISTRIBUTION
// ============================================================
router.get(
    '/workload-distribution',
    authenticate,
    authorizeManager,
    async (req, res) => {
        try {
            const companyId = req.user.companyId;

            const distribution = await aiSuggestionService.getWorkloadDistribution(
                companyId
            );

            res.json({
                message: 'Workload distribution retrieved',
                distribution,
            });
        } catch (error) {
            console.error('Error getting distribution:', error);
            res.status(500).json({
                message: 'Error getting workload distribution',
                error: error.message,
            });
        }
    }
);

module.exports = router;