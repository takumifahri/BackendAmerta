import { RewardRepository } from "../repository/reward.repository.js";
import { prisma } from "../database/index.js";
import HttpException from "../utils/HttpExecption.utils.js";
import type { IRewardService, RewardResponse, CreateRewardRequest, UserRewardResponse } from "../interface/reward.interface.js";

export class RewardService implements IRewardService {
    private rewardRepository = new RewardRepository();

    async getAllRewards(): Promise<RewardResponse[]> {
        return await this.rewardRepository.findAll();
    }

    async getAllRewardsAdmin(): Promise<RewardResponse[]> {
        return await this.rewardRepository.findAllAdmin();
    }

    async getRewardById(id: string): Promise<RewardResponse> {
        const reward = await this.rewardRepository.findById(id);
        if (!reward) throw new HttpException(404, "Reward not found");
        return reward as RewardResponse;
    }

    async createReward(data: CreateRewardRequest): Promise<RewardResponse> {
        return await this.rewardRepository.create(data);
    }

    async updateReward(id: string, data: Partial<CreateRewardRequest>): Promise<RewardResponse> {
        return await this.rewardRepository.update(id, data);
    }

    async deleteReward(id: string): Promise<void> {
        await this.rewardRepository.delete(id);
    }

    async redeemReward(userId: string, rewardId: string): Promise<any> {
        const reward = await this.rewardRepository.findById(rewardId);
        if (!reward) throw new HttpException(404, "Reward tidak ditemukan");
        if (!reward.isActive) throw new HttpException(400, "Reward ini sedang tidak aktif");

        // Check user points
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "User tidak ditemukan");
        if (user.points < reward.cost) throw new HttpException(400, "Amerta Coins tidak cukup");

        // Generate a random code for the voucher
        const code = `AMRT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        return await this.rewardRepository.createUserReward(userId, rewardId, reward.cost, code);
    }

    async getUserRewards(userId: string): Promise<any[]> {
        return await this.rewardRepository.findUserRewards(userId);
    }
}
