import nodemailer from "nodemailer";
import logger from "../utils/logger.utils.js";

export class MailerService {
    public transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "465",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Verify connection on startup
        this.transporter.verify((error) => {
            if (error) {
                logger.error("SMTP Connection Error:", error);
            } else {
                logger.info("SMTP Server is ready to take our messages");
            }
        });
    }

    public getMailFrom(): string {
        return process.env.MAIL_FROM || '"Amerta" <noreply@amerta.com>';
    }
}

export default new MailerService();
