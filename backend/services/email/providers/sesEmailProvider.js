const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

class SesEmailProvider {
    constructor() {
        this.client = new SESv2Client({
            region: process.env.AWS_REGION,
            credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
                ? {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                }
                : undefined,
        });
        this.fromEmail = process.env.EMAIL_FROM;
    }

    async send({ to, subject, html, text }) {
        const command = new SendEmailCommand({
            FromEmailAddress: this.fromEmail,
            Destination: { ToAddresses: [to] },
            Content: {
                Simple: {
                    Subject: { Data: subject },
                    Body: {
                        Html: { Data: html || '' },
                        Text: { Data: text || '' },
                    },
                },
            },
        });

        const result = await this.client.send(command);
        return { provider: 'ses', messageId: result.MessageId };
    }
}

module.exports = SesEmailProvider;