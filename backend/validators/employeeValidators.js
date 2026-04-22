const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};

const createEmployeeValidation = [
    body('fullName').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('department').optional().trim().isLength({ max: 100 }),
];

const updateEmployeeValidation = [
    param('id').isMongoId(),
    body('fullName').optional().trim().isLength({ min: 2, max: 100 }),
    body('department').optional().trim().isLength({ max: 100 }),
    body('currentWorkload').optional().isInt({ min: 0, max: 10000 }),
];

const getByIdValidation = [
    param('id').isMongoId(),
];

const listEmployeesValidation = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim().isLength({ max: 100 }),
    query('department').optional().trim().isLength({ max: 100 }),
];

module.exports = {
    handleValidationErrors,
    createEmployeeValidation,
    updateEmployeeValidation,
    getByIdValidation,
    listEmployeesValidation,
};