import { Router } from "express";
import { authenticate, checkRole } from "../middleware/auth.middleware.js";
import user_management_router from "./admin/user.management.routes.js";
import post_management_router from "./admin/post.management.routes.js";

const router = Router();

// Apply admin protection to all routes in this file
router.use(authenticate);
router.use(checkRole(["ADMIN"]));

// Management Routes
router.use("/users", user_management_router);
router.use("/posts", post_management_router);

export default router;
