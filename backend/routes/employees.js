const express = require('express');
const multer = require('multer');

const { authenticate, authorizeManager } = require('../middlewares/auth');
const employeeController = require('../controllers/employeeController');
const {
    createEmployeeValidation,
    updateEmployeeValidation,
    getByIdValidation,
    listEmployeesValidation,
    handleValidationErrors,
} = require('../validators/employeeValidators');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authenticate, authorizeManager);

router.post(
    '/',
    createEmployeeValidation,
    handleValidationErrors,
    employeeController.createEmployee
);

router.get(
    '/',
    listEmployeesValidation,
    handleValidationErrors,
    employeeController.getEmployees
);

router.get(
    '/:id',
    getByIdValidation,
    handleValidationErrors,
    employeeController.getEmployeeById
);

router.put(
    '/:id',
    updateEmployeeValidation,
    handleValidationErrors,
    employeeController.updateEmployee
);

router.delete(
    '/:id',
    getByIdValidation,
    handleValidationErrors,
    employeeController.deleteEmployee
);

router.post(
    '/bulk-import',
    upload.single('file'),
    employeeController.bulkImportEmployees
);

module.exports = router;