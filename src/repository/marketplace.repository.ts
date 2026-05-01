import { prisma } from "../database/index.js";
import type { CreateMarketplaceItemRequest, CreateOrderRequest } from "../interface/marketplace.interface.js";
import { MarketplaceOrderStatus } from "../generated/prisma/enums.js";

export class MarketplaceRepository {
    async findAllItems() {
        return await prisma.marketplaceItem.findMany({
            where: { deletedAt: null },
            include: { images: { select: { url: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findItemById(id: string) {
        return await prisma.marketplaceItem.findFirst({
            where: { id, deletedAt: null },
            include: { images: { select: { url: true } } }
        });
    }

    async createOrder(userId: string, data: {
        recipientName: string;
        phone: string;
        address: string;
        totalPrice: number;
        totalPointsAwarded: number;
        discountAmount: number;
        userRewardId?: string;
        items: { itemId: string, quantity: number, priceAtPurchase: number, pointsAtPurchase: number }[]
    }) {
        const { items, cartItemIds, ...orderData } = data as any;
        return await prisma.marketplaceOrder.create({
            data: {
                ...orderData,
                userId,
                status: MarketplaceOrderStatus.PENDING,
                items: {
                    create: items
                }
            },
            include: { 
                items: { include: { item: { include: { images: { select: { url: true } } } } } } 
            }
        });
    }

    async findOrderById(id: string) {
        return await prisma.marketplaceOrder.findUnique({
            where: { id },
            include: { 
                items: { include: { item: { include: { images: { select: { url: true } } } } } } 
            }
        });
    }

    async updateOrder(id: string, data: any) {
        return await prisma.marketplaceOrder.update({
            where: { id },
            data,
            include: { 
                items: { include: { item: { include: { images: { select: { url: true } } } } } } 
            }
        });
    }

    async findOrdersByUserId(userId: string) {
        return await prisma.marketplaceOrder.findMany({
            where: { userId, deletedAt: null },
            include: { 
                items: { include: { item: { include: { images: { select: { url: true } } } } } } 
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Cart Methods
    async findCartByUserId(userId: string) {
        return await prisma.cartItem.findMany({
            where: { userId },
            include: { item: { include: { images: { select: { url: true } } } } }
        });
    }

    async upsertCartItem(userId: string, itemId: string, quantity: number) {
        return await prisma.cartItem.upsert({
            where: { userId_itemId: { userId, itemId } },
            create: { userId, itemId, quantity },
            update: { quantity: { increment: quantity } },
            include: { item: { include: { images: { select: { url: true } } } } }
        });
    }

    async updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
        return await prisma.cartItem.update({
            where: { userId_itemId: { userId, itemId } },
            data: { quantity },
            include: { item: { include: { images: { select: { url: true } } } } }
        });
    }

    async removeFromCart(userId: string, itemId: string) {
        return await prisma.cartItem.delete({
            where: { userId_itemId: { userId, itemId } }
        });
    }

    async clearCart(userId: string) {
        return await prisma.cartItem.deleteMany({
            where: { userId }
        });
    }
}
