const logger = require('../../../utils/logger');

class ConsoleEmailProvider {
    async send({ to, subject, html, text }) {
        logger.info('Mock Email Sent', { to, subject, textPreview: text?.slice(0, 120) });
        return { provider: 'console', accepted: [to] }
    }
}

module.exports = ConsoleEmailProvider;