const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, authorizeManager } = require('../middlewares/auth');

const router = express.Router();

// Validation middleware to handle errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ============================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================

// 1. REGISTER COMPANY
router.post(
    '/company-register',
    [
        body('companyName').trim().notEmpty().withMessage('Company name required'),
        body('managerName').trim().notEmpty().withMessage('Manager name required'),
        body('managerEmail').isEmail().withMessage('Valid email required'),
        body('managerPassword')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    handleValidationErrors,
    authController.registerCompany
);

// 2. LOGIN
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password required'),
    ],
    handleValidationErrors,
    authController.login
);

// ============================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================

// 3. CHANGE PASSWORD (Employee on first login)
router.post(
    '/change-password',
    authenticate,
    [
        body('currentPassword').notEmpty().withMessage('Current password required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters'),
    ],
    handleValidationErrors,
    authController.changePassword
);

// 4. CREATE EMPLOYEE (Manager only)
// router.post(
//     '/create-employee',
//     authenticate,
//     authorizeManager,
//     [
//         body('fullName').trim().notEmpty().withMessage('Full name required'),
//         body('email').isEmail().withMessage('Valid email required'),
//     ],
//     handleValidationErrors,
//     authController.createEmployee
// );

// 5. GET CURRENT USER
router.get('/me', authenticate, authController.getMe);

// 6. GET COMPANY EMPLOYEES (Manager only)
// router.get(
//     '/employees',
//     authenticate,
//     authorizeManager,
//     authController.getCompanyEmployees
// );

module.exports = router;