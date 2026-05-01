export interface RewardResponse {
    id: string;
    title: string;
    description: string;
    cost: number;
    type: string;
    icon: string | null;
    color: string | null;
    tag: string | null;
    rarity: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRewardRequest {
    title: string;
    description: string;
    cost: number;
    type: string;
    icon?: string;
    color?: string;
    tag?: string;
    rarity?: string;
    isActive?: boolean;
}

export interface UserRewardResponse {
    id: string;
    reward: RewardResponse;
    code: string | null;
    isUsed: boolean;
    usedAt: Date | null;
    createdAt: Date;
}

export interface IRewardService {
    getAllRewards(): Promise<RewardResponse[]>;
    getAllRewardsAdmin(): Promise<RewardResponse[]>;
    getRewardById(id: string): Promise<RewardResponse>;
    createReward(data: CreateRewardRequest): Promise<RewardResponse>;
    updateReward(id: string, data: Partial<CreateRewardRequest>): Promise<RewardResponse>;
    deleteReward(id: string): Promise<void>;
    redeemReward(userId: string, rewardId: string): Promise<UserRewardResponse>;
    getUserRewards(userId: string): Promise<UserRewardResponse[]>;
}
