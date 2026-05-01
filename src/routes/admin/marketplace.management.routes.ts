import { Router } from "express";
import MarketplaceAdminController from "../../controller/admin/marketplace.admin.controller.js";
import { UploadMiddleware } from "../../utils/file/multerConfig.js";

const router = Router();

// These routes are already protected by authenticate and checkRole(['ADMIN']) in admin.routes.ts

// Item management
router.get("/items", MarketplaceAdminController.getAllItems);
router.post("/items", UploadMiddleware.multiple('MARKETPLACE_ITEM', 'images'), MarketplaceAdminController.createItem);
router.put("/items/:id", UploadMiddleware.multiple('MARKETPLACE_ITEM', 'images'), MarketplaceAdminController.updateItem);
router.delete("/items/:id", MarketplaceAdminController.deleteItem);

// Order management
router.get("/orders", MarketplaceAdminController.getAllOrders);
router.patch("/orders/:orderId/verify", MarketplaceAdminController.verifyOrder);

export default router;
