import type { Request, Response, NextFunction } from "express";
import { MarketplaceAdminService } from "../../service/admin/marketplace.admin.service.js";

class MarketplaceAdminController {
    constructor(
        private adminService: MarketplaceAdminService = new MarketplaceAdminService()
    ) {}

    createItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files as Express.Multer.File[];
            const imageUrls = files?.map(file => `/storage/uploads/marketplace-items/${file.filename}`) || [];
            
            const result = await this.adminService.createItem({
                ...req.body,
                price: parseInt(req.body.price),
                stock: parseInt(req.body.stock),
                points: parseInt(req.body.points || 0),
                images: imageUrls
            });
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

    getAllItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.adminService.getAllItems();
            res.status(200).json({
                success: true,
                message: "All items retrieved successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    updateItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const files = req.files as Express.Multer.File[];
            const imageUrls = files?.map(file => `/storage/uploads/marketplace-items/${file.filename}`) || [];
            
            const payload = {
                ...req.body,
                price: req.body.price ? parseInt(req.body.price) : undefined,
                stock: req.body.stock ? parseInt(req.body.stock) : undefined,
                points: req.body.points ? parseInt(req.body.points) : undefined,
            };

            if (imageUrls.length > 0) {
                payload.images = imageUrls;
            }

            const result = await this.adminService.updateItem(id as string, payload);
            res.status(200).json({
                success: true,
                message: "Item updated successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { soft } = req.query;
            
            if (soft === "true") {
                await this.adminService.softDeleteItem(id as string);
            } else {
                await this.adminService.deleteItem(id as string);
            }

            res.status(200).json({
                success: true,
                message: `Item ${soft === "true" ? "soft " : ""}deleted successfully`
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new MarketplaceAdminController();
