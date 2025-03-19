export const confirmationTemplate = (email, magicToken) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Sign-Up</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff; /* Blue color for trust and clarity */
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            color: #333333;
            text-align: center;
        }
        .content h2 {
            font-size: 20px;
            margin-bottom: 10px;
            color: #007bff; /* Blue color for emphasis */
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin: 10px 0;
        }
        .magic-link-button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
        }
        .magic-link-button:hover {
            background-color: #0056b3; /* Darker blue on hover */
        }
        .footer {
            text-align: center;
            padding: 15px;
            background-color: #f4f4f4;
            color: #777777;
            font-size: 14px;
        }
        .footer p {
            margin: 0;
        }
        .contact-info {
            margin-top: 20px;
            text-align: center;
        }
        .contact-info a {
            color: #007bff;
            text-decoration: none;
        }
        .contact-info a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome to MedEase!</h1>
        </div>
        <div class="content">
            <h2>Confirm Your Sign-Up</h2>
            <p>Thank you for signing up with MedEase. To complete your registration, please click the button below to confirm your email address:</p>
            <a href="https://medease-server.up.railway.app/auth/email/confirm?email=${email}&token=${magicToken}" class="magic-link-button">Confirm My Email</a>
            <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
            <p><a href="https://medease-server.up.railway.app/auth/email/confirm?email=${email}&token=${magicToken}" style="color: #007bff; word-break: break-all;">https://medease-server.up.railway.app/auth/email/confirm?email=${email}&token=${magicToken}</a></p>
            <p>This link will expire in <strong>24 hours</strong>. If you did not sign up for an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MedEase. All rights reserved.</p>
            <div class="contact-info">
                <p>Need help? Contact us at <a href="mailto:medease@healthylife.com">medease@healthylife.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>`;
