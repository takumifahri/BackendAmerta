import type { Request, Response, NextFunction } from "express";
import { MarketplaceService } from "../service/marketplace.service.js";
import { MarketplaceOrderStatus } from "../generated/prisma/enums.js";
const marketplaceService = new MarketplaceService();

export const getAllItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await marketplaceService.getAllItems();
        res.status(200).json({
            status: 200,
            success: true,
            message: "Items retrieved successfully",
            data: items,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await marketplaceService.getItemById(req.params.id as string);
        if (!item) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Item not found",
                data: null,
                timestamp: new Date().toISOString()
            });
        }
        res.status(200).json({
            status: 200,
            success: true,
            message: "Item retrieved successfully",
            data: item,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const cart = await marketplaceService.getCart(userId);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Cart retrieved successfully",
            data: cart,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const cartItem = await marketplaceService.addToCart(userId, req.body);
        res.status(201).json({
            status: 201,
            success: true,
            message: "Item added to cart",
            data: cartItem,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const { itemId } = req.params;
        await marketplaceService.removeFromCart(userId, itemId as string);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Item removed from cart",
            data: null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export const updateCartQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const { itemId } = req.params;
        const { quantity } = req.body;
        const cartItem = await marketplaceService.updateCartQuantity(userId, itemId as string, quantity);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Cart quantity updated",
            data: cartItem,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export const checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const order = await marketplaceService.checkout(userId, req.body);
        res.status(201).json({
            status: 201,
            success: true,
            message: "Order created successfully",
            data: order,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export const uploadPaymentProof = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const { orderId } = req.params;
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Payment proof image is required",
                data: null,
                timestamp: new Date().toISOString()
            });
        }

        const proofUrl = `/storage/uploads/payments/${file.filename}`;
        const order = await marketplaceService.uploadPaymentProof(orderId as string, userId, proofUrl);
        
        res.status(200).json({
            status: 200,
            success: true,
            message: "Payment proof uploaded successfully",
            data: order,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const orders = await marketplaceService.getUserOrders(userId);
        res.status(200).json({
            status: 200,
            success: true,
            message: "User orders retrieved successfully",
            data: orders,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};
