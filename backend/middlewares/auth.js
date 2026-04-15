const { verifyToken } = require('../utils/token');

// Verify JWT token
const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        req.user = decoded; // { userId, role, companyId }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Verify user is a manager
const authorizeManager = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Only managers can access this' });
    }
    next();
};

// Verify user is an employee
const authorizeEmployee = (req, res, next) => {
    if (req.user.role !== 'employee') {
        return res.status(403).json({ message: 'Only employees can access this' });
    }
    next();
};

module.exports = { authenticate, authorizeManager, authorizeEmployee };