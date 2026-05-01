import { MarketplaceAdminRepository } from "../../repository/admin/marketplace.admin.repository.js";
import type { IMarketplaceAdminService } from "../../interface/admin/marketplace.admin.interface.ts";
import type { MarketplaceItemResponse, OrderResponse } from "../../interface/marketplace.interface.js";
import { MarketplaceOrderStatus } from "../../generated/prisma/enums.js";
import HttpException from "../../utils/HttpExecption.utils.js";
import { prisma } from "../../database/index.js";
import logger from "../../utils/logger.utils.js";
import { Mailers } from "../../mailer.service.js";

export class MarketplaceAdminService implements IMarketplaceAdminService {
    constructor(
        private adminRepository: MarketplaceAdminRepository = new MarketplaceAdminRepository()
    ) {}

    async createItem(data: any): Promise<MarketplaceItemResponse> {
        return await this.adminRepository.createItem(data) as any;
    }

    async getAllOrders(): Promise<OrderResponse[]> {
        const orders = await this.adminRepository.findAllOrders();
        return orders as any;
    }

    async verifyOrder(orderId: string, status: MarketplaceOrderStatus): Promise<OrderResponse> {
        const order = await this.adminRepository.findOrderById(orderId);
        if (!order) {
            throw new HttpException(404, "Order not found");
        }

        const user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { email: true, name: true }
        });

        // If status is changed to COMPLETED, award points to user
        if (status === MarketplaceOrderStatus.COMPLETED && order.status !== MarketplaceOrderStatus.COMPLETED) {
            await prisma.$transaction(async (tx) => {
                await tx.marketplaceOrder.update({
                    where: { id: orderId },
                    data: { status }
                });

                await tx.user.update({
                    where: { id: order.userId },
                    data: { points: { increment: order.totalPointsAwarded } }
                });

                for (const item of order.items) {
                    await tx.marketplaceItem.update({
                        where: { id: item.itemId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            });
            logger.info(`Order ${orderId} completed. Awarded ${order.totalPointsAwarded} points to user ${order.userId}`);
        } else {
            await this.adminRepository.updateOrderStatus(orderId, status);
        }

        const updatedOrder = await this.adminRepository.findOrderById(orderId);

        // Send Email Notification
        if (user) {
            try {
                await Mailers.marketplace.sendOrderStatusEmail(user.email, updatedOrder as any, user.name ?? 'User');
            } catch (mailErr) {
                logger.error("Failed to send order status email", mailErr);
            }
        }

        return updatedOrder as any;
    }
}
