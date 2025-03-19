export const invalid = () => {
	return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error: Invalid Token</title>
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
                    .error-container {
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        padding: 40px;
                        text-align: center;
                        max-width: 400px;
                    }
                    h1 {
                        color: #dc3545; /* Red color for errors */
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 16px;
                        color: #333333;
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>Error: Invalid or Expired Token</h1>
                    <p>The confirmation link is invalid or has expired. Please request a new confirmation email.</p>
                </div>
            </body>
            </html>;
        `;
};
