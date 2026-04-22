const User = require('../models/User');

class EmployeeRepository {
    async create(employeeData) {
        const doc = new User(employeeData);
        return await doc.save();
    }

    async insertMany(employeeDocs) {
        return await User.insertMany(employeeDocs, { ordered: false });
    }

    async findByEmailInCompany(email, companyId) {
        return await User.findOne({
            email: email.toLowerCase(),
            companyId,
            role: 'employee',
        });
    }

    async findAllPaginated({ companyId, page, limit, filters }) {
        const query = {
            companyId,
            role: 'employee',
            isActive: true,
        };

        if (filters.search) {
            query.$or = [
                { fullName: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
                { department: { $regex: filters.search, $options: 'i' } },
            ];
        }

        if (filters.department) query.department = filters.department;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query),
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByIdInCompany(employeeId, companyId) {
        return await User.findOne({
            _id: employeeId,
            companyId,
            role: 'employee',
            isActive: true,
        }).select('-password');
    }

    async findRawByIdInCompany(employeeId, companyId) {
        return await User.findOne({
            _id: employeeId,
            companyId,
            role: 'employee',
            isActive: true,
        });
    }

    async updateById(employeeId, updateData) {
        return await User.findByIdAndUpdate(
            employeeId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');
    }

    async softDelete(employeeId) {
        return await User.findByIdAndUpdate(
            employeeId,
            {
                $set: {
                    isActive: false,
                },
            },
            { new: true }
        );
    }
}

module.exports = new EmployeeRepository();