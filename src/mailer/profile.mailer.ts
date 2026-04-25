import { MailerService } from "./mailer.service.js";
import logger from "../utils/logger.utils.js";

export class ProfileMailer extends MailerService {
    /**
     * Send Change Password OTP Email
     */
    async sendChangePasswordOTP(to: string, otp: string, expiresAt: Date) {
        const mailFrom = this.getMailFrom();
        const expiryFormatted = expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Ganti Password Amerta</title>
            <style>
                body {
                    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background-color: #f8fafc;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }
                .wrapper {
                    width: 100%;
                    table-layout: fixed;
                    background-color: #f8fafc;
                    padding-bottom: 40px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 24px;
                    overflow: hidden;
                    margin-top: 40px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }
                .header {
                    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
                    padding: 50px 40px;
                    text-align: center;
                }
                .header h1 {
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0;
                    letter-spacing: -0.05em;
                    text-transform: uppercase;
                }
                .content {
                    padding: 48px 40px;
                    color: #1e293b;
                    text-align: center;
                }
                .content h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: #0f172a;
                }
                .content p {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #475569;
                    margin-bottom: 32px;
                }
                .otp-container {
                    background-color: #fff7ed;
                    border-radius: 20px;
                    padding: 32px;
                    margin: 32px 0;
                    border: 1px solid #fed7aa;
                }
                .otp-label {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #9a3412;
                    margin-bottom: 12px;
                }
                .otp-code {
                    font-size: 48px;
                    font-weight: 800;
                    letter-spacing: 0.25em;
                    color: #ea580c;
                    margin: 0;
                    font-family: inherit;
                }
                .meta-info {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 32px;
                }
                .meta-info span {
                    color: #ef4444;
                    font-weight: 600;
                }
                .footer {
                    padding: 32px 40px;
                    text-align: center;
                    background-color: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                }
                .footer p {
                    font-size: 13px;
                    color: #94a3b8;
                    margin: 4px 0;
                }
                .warning-footer {
                    font-size: 12px;
                    color: #cbd5e1;
                    margin-top: 24px;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>AMERTA</h1>
                    </div>
                    <div class="content">
                        <h2>Permintaan Ganti Password</h2>
                        <p>Kami menerima permintaan untuk mengganti password akun Anda. Gunakan kode OTP di bawah ini untuk melanjutkan.</p>
                        
                        <div class="otp-container">
                            <div class="otp-label">KODE OTP GANTI PASSWORD</div>
                            <div class="otp-code">${otp}</div>
                        </div>
 
                        <div class="meta-info">
                            Kode ini akan berakhir pada pukul <span>${expiryFormatted}</span>
                        </div>
                        
                        <div class="warning-footer">
                            Jika Anda tidak merasa meminta hal ini, harap abaikan email ini dan segera amankan akun Anda.
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Amerta Technology. All rights reserved.</p>
                        <p>Jakarta, Indonesia</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        try {
            await this.transporter.sendMail({
                from: mailFrom,
                to,
                subject: `[Amerta] OTP Ganti Password: ${otp}`,
                html: htmlContent,
            });
            logger.info(`Change Password OTP Email sent to ${to}`);
        } catch (error) {
            logger.error(`Error sending email to ${to}:`, error);
            throw error;
        }
    }
}

export default new ProfileMailer();
