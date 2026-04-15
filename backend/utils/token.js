const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role, companyId) => {
    return jwt.sign(
        {
            userId,
            role,
            companyId,
        },
        process.env.JWT_SECRET || 'dev_secret_key',
        {
            expiresIn: process.env.JWT_EXPIRE || '7d',
        }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = { generateToken, verifyToken };