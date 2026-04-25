import nodemailer from "nodemailer";
import logger from "./utils/logger.utils.js";

class MailerService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Verify connection on startup
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error("SMTP Connection Error:", error);
            } else {
                logger.info("SMTP Server is ready to take our messages");
            }
        });
    }

    /**
     * Send OTP Email with a premium HTML template
     */
    async sendOTPEmail(to: string, otp: string, expiresAt: Date) {
        const mailFrom = process.env.MAIL_FROM || '"Amerta" <noreply@amerta.com>';
        const expiryFormatted = expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kode Verifikasi Amerta</title>
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
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
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
                    background-color: #f1f5f9;
                    border-radius: 20px;
                    padding: 32px;
                    margin: 32px 0;
                    border: 1px solid #e2e8f0;
                }
                .otp-label {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #64748b;
                    margin-bottom: 12px;
                }
                .otp-code {
                    font-size: 48px;
                    font-weight: 800;
                    letter-spacing: 0.25em;
                    color: #6366f1;
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
                        <h2>Verifikasi Akun Anda</h2>
                        <p>Terima kasih telah bergabung dengan Amerta. Gunakan kode verifikasi di bawah ini untuk menyelesaikan proses pendaftaran Anda.</p>
                        
                        <div class="otp-container">
                            <div class="otp-label">KODE VERIFIKASI ANDA</div>
                            <div class="otp-code">${otp}</div>
                        </div>

                        <div class="meta-info">
                            Kode ini akan berakhir pada pukul <span>${expiryFormatted}</span>
                        </div>
                        
                        <div class="warning-footer">
                            Abaikan email ini jika Anda tidak merasa melakukan pendaftaran.
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
                subject: `[Amerta] Your Verification Code: ${otp}`,
                html: htmlContent,
            });
            logger.info(`OTP Email sent to ${to}`);
        } catch (error) {
            logger.error(`Error sending email to ${to}:`, error);
            throw error;
        }
    }

    /**
     * Send Warning Email
     */
    async sendWarningEmail(to: string, title: string, message: string) {
        const mailFrom = process.env.MAIL_FROM || '"Amerta Admin" <admin@amerta.com>';
        
        const htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
            <h2 style="color: #ef4444;">${title}</h2>
            <p>${message}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280;">This is an automated security notification.</p>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: mailFrom,
                to,
                subject: `Security Alert: ${title}`,
                html: htmlContent,
            });
        } catch (error) {
            logger.error(`Error sending warning email to ${to}:`, error);
        }
    }
}

export default new MailerService();
