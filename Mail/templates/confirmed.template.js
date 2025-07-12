export const confirmed = () =>
	`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="refresh" content="5;url=http://front-end-mauve-ten.vercel.app/register/login">
            <title>Email Confirmed Successfully</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .confirmation-container {
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    padding: 40px;
                    text-align: center;
                    max-width: 400px;
                }
                h1 {
                    color: #007bff;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 16px;
                    color: #333333;
                }
                .icon {
                    font-size: 48px;
                    color: #28a745; /* Green color for success */
                    margin-bottom: 20px;
                }
                .redirect-message {
                    font-size: 14px;
                    color: #777777;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="confirmation-container">
                <div class="icon">✔️</div>
                <h1>Email Confirmed Successfully!</h1>
                <p>Thank you for confirming your email address. Your account is now active.</p>
                <p class="redirect-message">You will be redirected to the login page in 5 seconds...</p>
                <p>If you are not redirected, <a href="http://front-end-mauve-ten.vercel.app/register/login">click here</a>.</p>
            </div>
        </body>
        </html>
    `;
