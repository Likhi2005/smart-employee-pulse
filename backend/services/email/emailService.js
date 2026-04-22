const ConsoleEmailProvider = require('./providers/consoleEmailProvider');
const SesEmailProvider = require('./providers/sesEmailProvider');
const { welcomeEmployeeTemplate } = require('./template/welcomeEmployeeTemplate');

class EmailService {
    constructor() {
        const provider = process.env.EMAIL_PROVIDER || (process.env.NODE_ENV === 'production' ? 'ses' : 'console');

        this.provider = provider === 'ses'
            ? new SesEmailProvider()
            : new ConsoleEmailProvider();
    }

    async sendWelcomeEmployeeEmail({ to, fullName, companyName, tempPassword }) {
        const payload = welcomeEmployeeTemplate({ fullName, companyName, tempPassword });
        return await this.provider.send({
            to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
        });
    }

    async sendTaskEventNotification({ to, subject, html, text }) {
        return await this.provider.send({
            to,
            subject,
            html,
            text,
        });
    }
}

module.exports = new EmailService();