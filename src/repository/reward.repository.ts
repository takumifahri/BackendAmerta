import { prisma } from "../database/index.js";
import type { RewardResponse, CreateRewardRequest } from "../interface/reward.interface.js";

export class RewardRepository {
    async findAll(): Promise<RewardResponse[]> {
        return await prisma.reward.findMany({
            where: { deletedAt: null, isActive: true },
            orderBy: { createdAt: 'desc' }
        }) as RewardResponse[];
    }

    async findAllAdmin(): Promise<RewardResponse[]> {
        return await prisma.reward.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
        }) as RewardResponse[];
    }

    async findById(id: string): Promise<RewardResponse | null> {
        return await prisma.reward.findUnique({
            where: { id }
        }) as RewardResponse | null;
    }

    async create(data: CreateRewardRequest): Promise<RewardResponse> {
        return await prisma.reward.create({
            data
        }) as RewardResponse;
    }

    async update(id: string, data: Partial<CreateRewardRequest>): Promise<RewardResponse> {
        return await prisma.reward.update({
            where: { id },
            data
        }) as RewardResponse;
    }

    async delete(id: string): Promise<RewardResponse> {
        return await prisma.reward.update({
            where: { id },
            data: { deletedAt: new Date() }
        }) as RewardResponse;
    }

    async createUserReward(userId: string, rewardId: string, cost: number, code: string) {
        return await prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.user.update({
                where: { id: userId },
                data: { points: { decrement: cost } }
            });

            // Create UserReward
            return await tx.userReward.create({
                data: {
                    userId,
                    rewardId,
                    code
                },
                include: { reward: true }
            });
        });
    }

    async findUserRewards(userId: string) {
        return await prisma.userReward.findMany({
            where: { userId },
            include: { reward: true },
            orderBy: { createdAt: 'desc' }
        });
    }
}
