import { MarketplaceRepository } from "../repository/marketplace.repository.js";
import type { 
    IMarketplaceService, 
    MarketplaceItemResponse, 
    CreateMarketplaceItemRequest, 
    CreateOrderRequest, 
    OrderResponse,
    CartItemResponse,
    AddCartItemRequest
} from "../interface/marketplace.interface.js";
import HttpException from "../utils/HttpExecption.utils.js";
import { prisma } from "../database/index.js";
import logger from "../utils/logger.utils.js";
import { MarketplaceOrderStatus } from "../generated/prisma/enums.js";
import { Mailers } from "../mailer.service.js";
export class MarketplaceService implements IMarketplaceService {
    private marketplaceRepository: MarketplaceRepository;

    constructor() {
        this.marketplaceRepository = new MarketplaceRepository();
    }

    async getAllItems(): Promise<MarketplaceItemResponse[]> {
        const items = await this.marketplaceRepository.findAllItems();
        return items.map(item => ({
            ...item,
            category: item.category || null
        }));
    }

    async getItemById(id: string): Promise<MarketplaceItemResponse | null> {
        const item = await this.marketplaceRepository.findItemById(id);
        if (!item) return null;
        return {
            ...item,
            category: item.category || null
        };
    }

    async getCart(userId: string): Promise<CartItemResponse[]> {
        const cart = await this.marketplaceRepository.findCartByUserId(userId);
        return cart.map(item => ({
            ...item,
            item: {
                ...item.item,
                category: item.item.category || null
            }
        }));
    }

    async addToCart(userId: string, data: AddCartItemRequest): Promise<CartItemResponse> {
        const item = await this.marketplaceRepository.findItemById(data.itemId);
        if (!item) throw new HttpException(404, "Item not found");
        if (item.stock < data.quantity) throw new HttpException(400, "Insufficient stock");

        const cartItem = await this.marketplaceRepository.upsertCartItem(userId, data.itemId, data.quantity);
        return {
            ...cartItem,
            item: {
                ...cartItem.item,
                category: cartItem.item.category || null
            }
        };
    }

    async removeFromCart(userId: string, itemId: string): Promise<void> {
        await this.marketplaceRepository.removeFromCart(userId, itemId);
    }

    async updateCartQuantity(userId: string, itemId: string, quantity: number): Promise<CartItemResponse> {
        const item = await this.marketplaceRepository.findItemById(itemId);
        if (!item) throw new HttpException(404, "Item not found");
        if (item.stock < quantity) throw new HttpException(400, "Insufficient stock");

        const cartItem = await this.marketplaceRepository.updateCartItemQuantity(userId, itemId, quantity);
        return {
            ...cartItem,
            item: {
                ...cartItem.item,
                category: cartItem.item.category || null
            }
        };
    }

    async checkout(userId: string, data: CreateOrderRequest): Promise<OrderResponse> {
        let cart = await this.marketplaceRepository.findCartByUserId(userId);
        
        if (data.cartItemIds && data.cartItemIds.length > 0) {
            cart = cart.filter(item => data.cartItemIds!.includes(item.id));
        }

        if (cart.length === 0) {
            throw new HttpException(400, "Cart is empty or selected items not found");
        }

        let discountAmount = 0;
        if (data.userRewardId) {
            const userReward = await prisma.userReward.findUnique({
                where: { id: data.userRewardId },
                include: { reward: true }
            });

            if (!userReward || userReward.userId !== userId || userReward.isUsed) {
                throw new HttpException(400, "Voucher tidak valid atau sudah digunakan");
            }

            if (userReward.reward.type !== "VOUCHERS") {
                throw new HttpException(400, "Reward ini bukan voucher belanja");
            }

            discountAmount = userReward.reward.value || 0;
        }

        let totalPrice = 0;
        let totalPointsAwarded = 0;
        const itemsToOrder = [];

        for (const cartItem of cart) {
            if (cartItem.item.stock < cartItem.quantity) {
                throw new HttpException(400, `Insufficient stock for ${cartItem.item.name}`);
            }
            totalPrice += cartItem.item.price * cartItem.quantity;
            totalPointsAwarded += cartItem.item.points * cartItem.quantity;
            itemsToOrder.push({
                itemId: cartItem.itemId,
                quantity: cartItem.quantity,
                priceAtPurchase: cartItem.item.price,
                pointsAtPurchase: cartItem.item.points
            });
        }

        const finalPrice = Math.max(0, totalPrice - discountAmount);

        const order = await this.marketplaceRepository.createOrder(userId, {
            ...data,
            totalPrice: finalPrice,
            discountAmount,
            totalPointsAwarded,
            items: itemsToOrder
        });

        // Mark voucher as used if applied
        if (data.userRewardId) {
            await prisma.userReward.update({
                where: { id: data.userRewardId },
                data: { isUsed: true, usedAt: new Date() }
            });
        }

        // Clear only selected items from cart
        for (const cartItem of cart) {
            await this.marketplaceRepository.removeFromCart(userId, cartItem.itemId);
        }

        return order as any;
    }

    async uploadPaymentProof(orderId: string, userId: string, proofUrl: string): Promise<OrderResponse> {
        const order = await this.marketplaceRepository.findOrderById(orderId);
        if (!order) {
            throw new HttpException(404, "Order not found");
        }

        if (order.userId !== userId) {
            throw new HttpException(403, "Unauthorized to update this order");
        }

        return await this.marketplaceRepository.updateOrder(orderId, {
            paymentProof: proofUrl,
            status: MarketplaceOrderStatus.VERIFYING
        }) as any;
    }

    async getUserOrders(userId: string): Promise<OrderResponse[]> {
        const orders = await this.marketplaceRepository.findOrdersByUserId(userId);
        return orders as any;
    }
}
