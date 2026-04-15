const express = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');
const { authenticate, authorizeManager, authorizeEmployee } = require('../middlewares/auth');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ============================================================
// MANAGER ROUTES
// ============================================================

// 1. CREATE TASK
router.post(
    '/create',
    authenticate,
    authorizeManager,
    [
        body('title').trim().notEmpty().withMessage('Title required'),
        body('effort').isInt({ min: 1 }).withMessage('Effort must be at least 1'),
        body('priority')
            .optional()
            .isIn(['low', 'medium', 'high'])
            .withMessage('Invalid priority'),
    ],
    handleValidationErrors,
    taskController.createTask
);

// 2. ASSIGN TASK
router.post(
    '/assign',
    authenticate,
    authorizeManager,
    [
        body('taskId').notEmpty().withMessage('Task ID required'),
        body('employeeId').notEmpty().withMessage('Employee ID required'),
    ],
    handleValidationErrors,
    taskController.assignTask
);

// 3. GET TEAM TASKS
router.get(
    '/team-tasks',
    authenticate,
    authorizeManager,
    taskController.getTeamTasks
);

// 4. GET TEAM WORKLOAD
router.get(
    '/team-workload',
    authenticate,
    authorizeManager,
    taskController.getTeamWorkload
);

// ============================================================
// EMPLOYEE ROUTES
// ============================================================

// 5. GET MY TASKS
router.get(
    '/my-tasks',
    authenticate,
    authorizeEmployee,
    taskController.getMyTasks
);

// 6. ACCEPT TASK
router.post(
    '/accept',
    authenticate,
    authorizeEmployee,
    [body('taskId').notEmpty().withMessage('Task ID required')],
    handleValidationErrors,
    taskController.acceptTask
);

// 7. REJECT TASK
router.post(
    '/reject',
    authenticate,
    authorizeEmployee,
    [body('taskId').notEmpty().withMessage('Task ID required')],
    handleValidationErrors,
    taskController.rejectTask
);

// 8. COMPLETE TASK
router.post(
    '/complete',
    authenticate,
    authorizeEmployee,
    [body('taskId').notEmpty().withMessage('Task ID required')],
    handleValidationErrors,
    taskController.completeTask
);

// ============================================================
// SHARED ROUTES (Both manager and employee)
// ============================================================

// 9. GET TASK DETAILS
router.get(
    '/:taskId',
    authenticate,
    [param('taskId').notEmpty().withMessage('Task ID required')],
    handleValidationErrors,
    taskController.getTaskDetails
);

module.exports = router;