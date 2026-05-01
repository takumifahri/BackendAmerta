import { MailerService } from "./mailer.service.js";
import logger from "../utils/logger.utils.js";
import type { OrderResponse } from "../interface/marketplace.interface.js";
import { MarketplaceOrderStatus } from "../generated/prisma/enums.js";

export class MarketplaceMailer extends MailerService {
    /**
     * Send Order Status Update Email
     */
    async sendOrderStatusEmail(to: string, order: OrderResponse, userName: string) {
        const mailFrom = this.getMailFrom();
        const status = order.status;
        
        let statusMessage = "";
        let statusColor = "#6366f1";
        
        switch (status) {
            case MarketplaceOrderStatus.VERIFIED:
                statusMessage = "Pembayaran Anda telah terverifikasi! Pesanan Anda sedang kami siapkan.";
                statusColor = "#10b981";
                break;
            case MarketplaceOrderStatus.REJECTED:
                statusMessage = "Mohon maaf, bukti pembayaran Anda ditolak. Silakan hubungi admin untuk info lebih lanjut.";
                statusColor = "#ef4444";
                break;
            case MarketplaceOrderStatus.SHIPPED:
                statusMessage = "Pesanan Anda telah dikirim! Silakan pantau status pengiriman secara berkala.";
                statusColor = "#3b82f6";
                break;
            case MarketplaceOrderStatus.COMPLETED:
                statusMessage = "Pesanan Anda telah selesai. Terima kasih telah berbelanja di Amerta!";
                statusColor = "#059669";
                break;
            default:
                statusMessage = "Status pesanan Anda telah diperbarui.";
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { background: ${statusColor}; padding: 40px; text-align: center; color: white; }
                .content { padding: 40px; }
                .order-id { font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 8px; }
                .status-badge { display: inline-block; padding: 6px 12px; border-radius: 99px; background: ${statusColor}15; color: ${statusColor}; font-weight: bold; font-size: 12px; text-transform: uppercase; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Update Pesanan</h1>
                </div>
                <div class="content">
                    <p>Halo <strong>${userName}</strong>,</p>
                    <div class="order-id">ORDER ID: #${order.id.slice(0, 8).toUpperCase()}</div>
                    <div class="status-badge">${status}</div>
                    <p style="margin-top: 24px; line-height: 1.6;">${statusMessage}</p>
                    
                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 14px; font-weight: bold; margin-bottom: 12px;">Ringkasan Pesanan:</p>
                        <table style="width: 100%; font-size: 14px;">
                            <tr>
                                <td style="color: #64748b;">Total Pembayaran:</td>
                                <td style="text-align: right; font-weight: bold;">Rp ${order.totalPrice.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b;">Reward Poin:</td>
                                <td style="text-align: right; font-weight: bold; color: #10b981;">+${order.totalPointsAwarded} AP</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2026 Amerta Circular Economy</p>
                </div>
            </div>
        </body>
        </html>
        `;

        try {
            await this.transporter.sendMail({
                from: mailFrom,
                to,
                subject: `[Amerta] Update Status Pesanan #${order.id.slice(0, 8).toUpperCase()}`,
                html: htmlContent,
            });
            logger.info(`Order Update Email sent to ${to}`);
        } catch (error) {
            logger.error(`Error sending email to ${to}:`, error);
        }
    }
}

export default new MarketplaceMailer();
