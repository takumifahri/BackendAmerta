import type { Request, Response, NextFunction } from "express";
import { RewardService } from "../service/reward.service.js";
import HttpException from "../utils/HttpExecption.utils.js";

const rewardService = new RewardService();

const getAllRewards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rewards = await rewardService.getAllRewards();
        res.status(200).json({
            status: 200,
            success: true,
            message: "Rewards retrieved successfully",
            data: rewards
        });
    } catch (error) {
        next(error);
    }
};

const getAllRewardsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rewards = await rewardService.getAllRewardsAdmin();
        res.status(200).json({
            status: 200,
            success: true,
            message: "All rewards retrieved successfully for admin",
            data: rewards
        });
    } catch (error) {
        next(error);
    }
};

const createReward = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reward = await rewardService.createReward(req.body);
        res.status(201).json({
            status: 201,
            success: true,
            message: "Reward created successfully",
            data: reward
        });
    } catch (error) {
        next(error);
    }
};

const updateReward = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reward = await rewardService.updateReward(req.params.id as string, req.body);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Reward updated successfully",
            data: reward
        });
    } catch (error) {
        next(error);
    }
};

const deleteReward = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await rewardService.deleteReward(req.params.id as string);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Reward deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

const redeemReward = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new HttpException(401, "Unauthorized");
        const rewardId = req.params.id;
        const userReward = await rewardService.redeemReward(userId, rewardId as string);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Reward berhasil ditukarkan!",
            data: userReward
        });
    } catch (error) {
        next(error);
    }
};

const getUserRewards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new HttpException(401, "Unauthorized");
        const userRewards = await rewardService.getUserRewards(userId);
        res.status(200).json({
            status: 200,
            success: true,
            message: "History penukaran retrieved successfully",
            data: userRewards
        });
    } catch (error) {
        next(error);
    }
};

export const RewardController = {
    getAllRewards,
    getAllRewardsAdmin,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    getUserRewards
};
