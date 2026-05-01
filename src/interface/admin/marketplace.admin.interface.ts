import { MarketplaceOrderStatus } from "../../generated/prisma/enums.js";
import { MarketplaceItemResponse, OrderResponse } from "../marketplace.interface.js";

export interface IMarketplaceAdminService {
    createItem(data: any): Promise<MarketplaceItemResponse>;
    getAllOrders(): Promise<OrderResponse[]>;
    verifyOrder(orderId: string, status: MarketplaceOrderStatus): Promise<OrderResponse>;
}
