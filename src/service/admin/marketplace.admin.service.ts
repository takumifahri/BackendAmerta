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

        // Handle status transitions with side effects
        await prisma.$transaction(async (tx) => {
            await tx.marketplaceOrder.update({
                where: { id: orderId },
                data: { status }
            });

            // 1. Award points and decrement stock on COMPLETION
            if (status === MarketplaceOrderStatus.COMPLETED && order.status !== MarketplaceOrderStatus.COMPLETED) {
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
                logger.info(`Order ${orderId} completed. Awarded ${order.totalPointsAwarded} points to user ${order.userId}`);
            }

            // 2. Refund Voucher on REJECTION
            if (status === MarketplaceOrderStatus.REJECTED && order.status !== MarketplaceOrderStatus.REJECTED) {
                if (order.userRewardId) {
                    await tx.userReward.update({
                        where: { id: order.userRewardId },
                        data: { isUsed: false, usedAt: null }
                    });
                    logger.info(`Order ${orderId} rejected. Voucher ${order.userRewardId} refunded to user.`);
                }
            }
        });

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

    async getAllItems(): Promise<MarketplaceItemResponse[]> {
        return await this.adminRepository.findAllItems() as any;
    }

    async updateItem(id: string, data: any): Promise<MarketplaceItemResponse> {
        return await this.adminRepository.updateItem(id, data) as any;
    }

    async deleteItem(id: string): Promise<void> {
        await this.adminRepository.deleteItem(id);
    }

    async softDeleteItem(id: string): Promise<MarketplaceItemResponse> {
        return await this.adminRepository.softDeleteItem(id) as any;
    }
}
