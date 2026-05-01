import { prisma } from "../../database/index.js";
import { MarketplaceOrderStatus } from "../../generated/prisma/enums.js";

export class MarketplaceAdminRepository {
    async createItem(data: {
        name: string;
        description: string;
        price: number;
        stock: number;
        category?: string;
        points?: number;
        images: string[];
    }) {
        const { images, ...itemData } = data;
        return await prisma.marketplaceItem.create({
            data: {
                ...itemData,
                images: {
                    create: images.map(url => ({ url }))
                }
            },
            include: { images: { select: { url: true } } }
        });
    }

    async findAllOrders() {
        return await prisma.marketplaceOrder.findMany({
            where: { deletedAt: null },
            include: { 
                items: { include: { item: { include: { images: { select: { url: true } } } } } },
                user: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
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

    async updateOrderStatus(id: string, status: MarketplaceOrderStatus) {
        return await prisma.marketplaceOrder.update({
            where: { id },
            data: { status },
            include: { 
                items: { include: { item: { include: { images: { select: { url: true } } } } } } 
            }
        });
    }
}
