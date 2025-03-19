export const AppointDelteTemplate = (date) => ` <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Deletion Notification</title>
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
            background-color: #dc3545; /* Red color for deletion notification */
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
        }
        .content h3 {
            font-size: 20px;
            margin-bottom: 10px;
            color: #dc3545; /* Red color for emphasis */
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin: 10px 0;
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
            <h1>Appointment Deletion Notification</h1>
        </div>
        <div class="content">
            <h3>Your appointment has been deleted</h3>
            <p>We regret to inform you that your appointment scheduled for <strong>${date}</strong> has been deleted.</p>
            <p>If you have any questions or need further assistance, please feel free to contact us.</p>
            <div class="contact-info">
                <p>Contact us at: <a href="mailto:medease@healthylife.com">medease@healthylife.com</a></p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MedEase. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
