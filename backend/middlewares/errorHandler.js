const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err);

    if (err.isOperational) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            errors: err.details || null,
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};

module.exports = errorHandler;