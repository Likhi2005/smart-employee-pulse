const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const employeeService = require('../services/employeeService');

const createEmployee = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const result = await employeeService.createEmployee({
        companyId,
        fullName: req.body.fullName,
        email: req.body.email,
        department: req.body.department,
        skills: req.body.skills,
    });

    return success(res, {
        statusCode: 201,
        message: 'Employee created successfully',
        data: result,
    });
});

const getEmployees = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const { page = 1, limit = 10, search, department } = req.query;

    const result = await employeeService.getEmployees({
        companyId,
        page,
        limit,
        filters: { search, department },
    });

    return success(res, {
        message: 'Employees fetched successfully',
        data: result.items,
        meta: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        },
    });
});

const getEmployeeById = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const employee = await employeeService.getEmployeeById({
        companyId,
        employeeId: req.params.id,
    });

    return success(res, {
        message: 'Employee fetched successfully',
        data: employee,
    });
});

const updateEmployee = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const employee = await employeeService.updateEmployee({
        companyId,
        employeeId: req.params.id,
        updates: req.body,
    });

    return success(res, {
        message: 'Employee updated successfully',
        data: employee,
    });
});

const deleteEmployee = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const result = await employeeService.deleteEmployee({
        companyId,
        employeeId: req.params.id,
    });

    return success(res, {
        message: 'Employee deleted successfully',
        data: result,
    });
});

const bulkImportEmployees = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const report = await employeeService.bulkImportEmployees({
        companyId,
        file: req.file,
    });

    return success(res, {
        message: 'Bulk import completed',
        data: report,
    });
});

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    bulkImportEmployees,
};