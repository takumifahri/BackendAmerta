import { MarketplaceOrderStatus } from "../generated/prisma/enums.js";

export interface MarketplaceItemResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string | null;
    points: number;
    images: { url: string }[];
    createdAt: Date;
}

export interface CreateMarketplaceItemRequest {
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
    points?: number;
    images: string[]; // URLs
}

export interface CreateOrderRequest {
    recipientName: string;
    phone: string;
    address: string;
    cartItemIds?: string[]; // Optional: if provided, only checkout these items
}

export interface OrderItemResponse {
    id: string;
    itemId: string;
    quantity: number;
    priceAtPurchase: number;
    pointsAtPurchase: number;
    item?: MarketplaceItemResponse;
}

export interface OrderResponse {
    id: string;
    userId: string;
    totalPrice: number;
    paymentProof: string | null;
    status: MarketplaceOrderStatus;
    totalPointsAwarded: number;
    recipientName: string | null;
    phone: string | null;
    address: string | null;
    createdAt: Date;
    items?: OrderItemResponse[];
}

export interface CartItemResponse {
    id: string;
    userId: string;
    itemId: string;
    quantity: number;
    item: MarketplaceItemResponse;
}

export interface AddCartItemRequest {
    itemId: string;
    quantity: number;
}

export interface IMarketplaceService {
    getAllItems(): Promise<MarketplaceItemResponse[]>;
    getItemById(id: string): Promise<MarketplaceItemResponse | null>;
    
    // Cart methods
    getCart(userId: string): Promise<CartItemResponse[]>;
    addToCart(userId: string, data: AddCartItemRequest): Promise<CartItemResponse>;
    removeFromCart(userId: string, itemId: string): Promise<void>;
    updateCartQuantity(userId: string, itemId: string, quantity: number): Promise<CartItemResponse>;
    
    // Order methods
    checkout(userId: string, data: CreateOrderRequest): Promise<OrderResponse>;
    uploadPaymentProof(orderId: string, userId: string, proofUrl: string): Promise<OrderResponse>;
    getUserOrders(userId: string): Promise<OrderResponse[]>;
}
