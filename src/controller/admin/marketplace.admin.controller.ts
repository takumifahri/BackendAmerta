import type { Request, Response, NextFunction } from "express";
import { MarketplaceAdminService } from "../../service/admin/marketplace.admin.service.js";

class MarketplaceAdminController {
    constructor(
        private adminService: MarketplaceAdminService = new MarketplaceAdminService()
    ) {}

    createItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.adminService.createItem(req.body);
            res.status(201).json({
                success: true,
                message: "Item created successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.adminService.getAllOrders();
            res.status(200).json({
                success: true,
                message: "All orders retrieved successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    verifyOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            const result = await this.adminService.verifyOrder(orderId as string, status);
            res.status(200).json({
                success: true,
                message: `Order status updated to ${status}`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new MarketplaceAdminController();
