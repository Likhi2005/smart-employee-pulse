const User = require('../models/User');
const Company = require('../models/Company');
const Leaderboard = require('../models/Leaderboard');
const { generateToken } = require('../utils/token');

// ============================================================
// 1. COMPANY REGISTRATION (Manager registers company)
// ============================================================
const registerCompany = async (req, res) => {
    try {
        const { companyName, industry, managerName, managerEmail, managerPassword } = req.body;

        // Validate input
        if (!companyName || !managerName || !managerEmail || !managerPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if company already exists
        const existingCompany = await Company.findOne({ email: managerEmail });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company already registered' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: managerEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Create company
        const company = new Company({
            name: companyName,
            email: managerEmail,
            industry: industry || 'Other',
            managerName,
            managerEmail,
        });

        const savedCompany = await company.save();

        // Create manager user
        const manager = new User({
            fullName: managerName,
            email: managerEmail,
            password: managerPassword,
            role: 'manager',
            companyId: savedCompany._id,
            isPasswordChanged: true, // Manager is not required to change password
        });

        const savedManager = await manager.save();

        // Generate token for manager
        const token = generateToken(savedManager._id, 'manager', savedCompany._id);

        res.status(201).json({
            message: 'Company registered successfully',
            token,
            user: {
                id: savedManager._id,
                fullName: savedManager.fullName,
                email: savedManager.email,
                role: 'manager',
                companyId: savedCompany._id,
            },
            company: {
                id: savedCompany._id,
                name: savedCompany.name,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

// ============================================================
// 2. USER LOGIN (Manager or Employee)
// ============================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() })
            .populate('companyId', 'name');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user account is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is disabled' });
        }

        // Generate token
        const token = generateToken(user._id, user.role, user.companyId._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                companyId: user.companyId._id,
                companyName: user.companyId.name,
                isPasswordChanged: user.isPasswordChanged, // Frontend uses this
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

// ============================================================
// 3. CHANGE PASSWORD (Employee on first login)
// ============================================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId; // From JWT middleware

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        user.isPasswordChanged = true;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Password change failed', error: error.message });
    }
};

// // ============================================================
// // 4. CREATE EMPLOYEE (Manager creates employee account)
// // ============================================================
// const createEmployee = async (req, res) => {
//     try {
//         const { fullName, email, department } = req.body;
//         const managerId = req.user.userId;
//         const companyId = req.user.companyId;

//         // Validate input
//         if (!fullName || !email) {
//             return res.status(400).json({ message: 'Full name and email required' });
//         }

//         // Check if email already exists in this company
//         const existingUser = await User.findOne({ email: email.toLowerCase(), companyId });
//         if (existingUser) {
//             return res.status(400).json({ message: 'Email already exists in company' });
//         }

//         // Generate temporary password (user must change on first login)
//         const tempPassword = Math.random().toString(36).slice(-8); // Random 8-char password

//         // Create employee
//         const employee = new User({
//             fullName,
//             email: email.toLowerCase(),
//             password: tempPassword,
//             role: 'employee',
//             companyId,
//             department: department || 'Not specified',
//             isPasswordChanged: false, // Employee must change password on first login
//         });

//         const savedEmployee = await employee.save();

//         // Create leaderboard entry for employee
//         const leaderboard = new Leaderboard({
//             userId: savedEmployee._id,
//             companyId,
//             points: 0,
//             tasksCompleted: 0,
//             gamePoints: 0,
//         });

//         await leaderboard.save();

//         res.status(201).json({
//             message: 'Employee created successfully',
//             employee: {
//                 id: savedEmployee._id,
//                 fullName: savedEmployee.fullName,
//                 email: savedEmployee.email,
//                 department: savedEmployee.department,
//                 role: 'employee',
//             },
//             tempPassword, // Send this to manager (should be shared securely)
//         });
//     } catch (error) {
//         console.error('Create employee error:', error);
//         res.status(500).json({ message: 'Employee creation failed', error: error.message });
//     }
// };

// ============================================================
// 5. GET CURRENT USER (Verify token)
// ============================================================
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).populate('companyId', 'name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                companyId: user.companyId._id,
                companyName: user.companyId.name,
                currentWorkload: user.currentWorkload,
                isPasswordChanged: user.isPasswordChanged,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};


// // ============================================================
// // 6. GET COMPANY EMPLOYEES (Manager only)
// // ============================================================
// const getCompanyEmployees = async (req,res) => {
//     try{
//         const companyId = req.user.companyId;

//         const employees = await User.find({
//             companyId,
//             role: 'employee',
//             isActive: true,
//         })
//         .select('-password')
//         .sort({ createdAt: -1 });

//         res.json({
//             message: 'Employees retrieved successfully',
//             employees,
//         });
//     } catch (error) {
//         console.error('Error fetching company employees:', error);
//         res.status(500).json({
//             message: 'Failed to fetch employees',
//             error: error.message,
//         });
//     }
// };

module.exports = {
    registerCompany,
    login,
    changePassword,
    // createEmployee,
    getMe,
    // getCompanyEmployees,
};