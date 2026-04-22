const bcrypt = require('bcryptjs');
const { parse } = require('csv-parse/sync');
const AppError = require('../utils/AppError');
const employeeRepository = require('../repositories/employeeRepository');
const emailService = require('./email/emailService');
const Company = require('../models/Company');

class EmployeeService {
    generateTempPassword() {
        return Math.random().toString(36).slice(-10);
    }

    async createEmployee({ companyId, fullName, email, department }) {
        const exists = await employeeRepository.findByEmailInCompany(email, companyId);
        if (exists) throw new AppError('Email already exists in company', 409);

        const tempPassword = this.generateTempPassword();

        const employee = await employeeRepository.create({
            fullName,
            email: email.toLowerCase(),
            password: tempPassword,
            role: 'employee',
            companyId,
            department: department || 'Not specified',
            isPasswordChanged: false,
            isActive: true,
        });

        const company = await Company.findById(companyId).select('name');

        await emailService.sendWelcomeEmployeeEmail({
            to: employee.email,
            fullName: employee.fullName,
            companyName: company?.name || 'your company',
            tempPassword,
        });

        return {
            employee: {
                id: employee._id,
                fullName: employee.fullName,
                email: employee.email,
                department: employee.department,
                role: employee.role,
                isActive: employee.isActive,
                isPasswordChanged: employee.isPasswordChanged,
            },
            tempPassword,
        };
    }

    async getEmployees({ companyId, page = 1, limit = 10, filters = {} }) {
        return await employeeRepository.findAllPaginated({
            companyId,
            page: Number(page),
            limit: Number(limit),
            filters,
        });
    }

    async getEmployeeById({ companyId, employeeId }) {
        const employee = await employeeRepository.findByIdInCompany(employeeId, companyId);
        if (!employee) throw new AppError('Employee not found', 404);
        return employee;
    }

    async updateEmployee({ companyId, employeeId, updates }) {
        const existing = await employeeRepository.findRawByIdInCompany(employeeId, companyId);
        if (!existing) throw new AppError('Employee not found', 404);

        const allowed = ['fullName', 'department', 'currentWorkload', 'isActive'];
        const safeUpdates = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) safeUpdates[key] = updates[key];
        }

        const updated = await employeeRepository.updateById(employeeId, safeUpdates);
        return updated;
    }

    async deleteEmployee({ companyId, employeeId }) {
        const existing = await employeeRepository.findRawByIdInCompany(employeeId, companyId);
        if (!existing) throw new AppError('Employee not found', 404);

        await employeeRepository.softDelete(employeeId);
        return { id: employeeId };
    }

    parseImportFile(file) {
        if (!file) throw new AppError('No file uploaded', 400);

        const mimetype = file.mimetype || '';
        const text = file.buffer.toString('utf-8').trim();

        if (!text) throw new AppError('Uploaded file is empty', 400);

        if (mimetype.includes('application/json') || file.originalname.toLowerCase().endsWith('.json')) {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) throw new AppError('JSON must be an array of records', 400);
            return parsed;
        }

        if (
            mimetype.includes('text/csv') ||
            mimetype.includes('application/vnd.ms-excel') ||
            file.originalname.toLowerCase().endsWith('.csv')
        ) {
            return parse(text, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
        }

        throw new AppError('Unsupported file type. Use CSV or JSON', 400);
    }

    validateImportRecord(record, index) {
        const errors = [];
        const clean = {
            fullName: (record.fullName || '').trim(),
            email: (record.email || '').trim().toLowerCase(),
            department: (record.department || 'Not specified').trim(),
        };

        if (!clean.fullName || clean.fullName.length < 2) errors.push('Invalid fullName');
        if (!clean.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) errors.push('Invalid email');

        return {
            index,
            isValid: errors.length === 0,
            errors,
            clean,
        };
    }

    async bulkImportEmployees({ companyId, file }) {
        const records = this.parseImportFile(file);

        const report = {
            total: records.length,
            inserted: 0,
            failed: 0,
            failedRecords: [],
        };

        if (records.length === 0) return report;

        const validated = records.map((record, i) => this.validateImportRecord(record, i + 1));

        const validRows = [];
        for (const row of validated) {
            if (!row.isValid) {
                report.failed++;
                report.failedRecords.push({
                    row: row.index,
                    email: row.clean.email || null,
                    errors: row.errors,
                });
                continue;
            }

            const exists = await employeeRepository.findByEmailInCompany(row.clean.email, companyId);
            if (exists) {
                report.failed++;
                report.failedRecords.push({
                    row: row.index,
                    email: row.clean.email,
                    errors: ['Email already exists in company'],
                });
                continue;
            }

            validRows.push(row.clean);
        }

        if (validRows.length > 0) {
            const docs = [];
            for (const row of validRows) {
                const tempPassword = this.generateTempPassword();
                const hashed = await bcrypt.hash(tempPassword, 10);

                docs.push({
                    fullName: row.fullName,
                    email: row.email,
                    password: hashed,
                    role: 'employee',
                    companyId,
                    department: row.department,
                    isPasswordChanged: false,
                    isActive: true,
                });
            }

            const insertedDocs = await employeeRepository.insertMany(docs);
            report.inserted = insertedDocs.length;

            const company = await Company.findById(companyId).select('name');
            for (let i = 0; i < insertedDocs.length; i++) {
                const emp = insertedDocs[i];
                await emailService.sendWelcomeEmployeeEmail({
                    to: emp.email,
                    fullName: emp.fullName,
                    companyName: company?.name || 'your company',
                    tempPassword: 'Please reset via first login flow',
                });
            }
        }

        return report;
    }
}

module.exports = new EmployeeService();