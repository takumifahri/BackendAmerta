import { Router } from "express";
import { RewardController } from "../controller/reward.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const reward_router = Router();

// Public route to fetch active rewards
reward_router.get("/", RewardController.getAllRewards);

// User routes
reward_router.post("/redeem/:id", authenticate, RewardController.redeemReward);
reward_router.get("/my-rewards", authenticate, RewardController.getUserRewards);

// Admin routes
reward_router.get("/admin", authenticate, RewardController.getAllRewardsAdmin);
reward_router.post("/", authenticate, RewardController.createReward);
reward_router.patch("/:id", authenticate, RewardController.updateReward);
reward_router.delete("/:id", authenticate, RewardController.deleteReward);

export default reward_router;
