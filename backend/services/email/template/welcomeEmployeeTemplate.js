const welcomeEmployeeTemplate = ({ fullName, companyName, tempPassword }) => {
    const subject = `Welcome to ${companyName}`;
    const text = `Hi ${fullName},
Welcome to ${companyName}.
Your temporary password is: ${tempPassword}
Please login and change your password immediately.`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Welcome, ${fullName}</h2>
            <p>You have been added to <strong>${companyName}</strong>.</p>
            <p>Your temporary password:</p>
            <p style="font-size: 18px; font-weight: bold;">${tempPassword}</p>
            <p>Please login and change your password immediately.</p>
        </div>
    `;

    return { subject, text, html };
};

module.exports = { welcomeEmployeeTemplate };