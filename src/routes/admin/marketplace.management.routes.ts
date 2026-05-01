import { Router } from "express";
import MarketplaceAdminController from "../../controller/admin/marketplace.admin.controller.js";
const router = Router();

// These routes are already protected by authenticate and checkRole(['ADMIN']) in admin.routes.ts

// Item management
router.post("/items", MarketplaceAdminController.createItem);

// Order management
router.get("/orders", MarketplaceAdminController.getAllOrders);
router.patch("/orders/:orderId/verify", MarketplaceAdminController.verifyOrder);

export default router;
