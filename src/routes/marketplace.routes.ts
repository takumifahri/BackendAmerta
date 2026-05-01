import { Router } from "express";
import * as MarketplaceController from "../controller/marketplace.controller.js";
import { authenticate, checkRole } from "../middleware/auth.middleware.js";
import { UploadMiddleware } from "../utils/fileHandler.utils.js";

const router = Router();

// Public routes
router.get("/items", MarketplaceController.getAllItems);
router.get("/items/:id", MarketplaceController.getItemById);

// Authenticated routes
router.use(authenticate);

// Cart routes
router.get("/cart", MarketplaceController.getCart);
router.post("/cart", MarketplaceController.addToCart);
router.patch("/cart/:itemId", MarketplaceController.updateCartQuantity);
router.delete("/cart/:itemId", MarketplaceController.removeFromCart);

// Checkout & Orders
router.post("/checkout", MarketplaceController.checkout);
router.get("/my-orders", MarketplaceController.getUserOrders);
router.post("/orders/:orderId/payment", UploadMiddleware.single('PAYMENT_PROOF', 'image'), MarketplaceController.uploadPaymentProof);

export default router;
