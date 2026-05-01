import { prisma } from "../database/index.js";

export interface IProfileRepository {
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        name?: string | null;
        profilePicture?: string | null;
        phone?: string | null;
        address?: string | null;
        longitude?: number | null; 
        latitude?: number | null;
    }): Promise<any>;
    changePassword(userId: string, newPassword: string): Promise<void>;
    redeemPoints(userId: string, points: number): Promise<any>;
}

export class ProfileRepository implements IProfileRepository {
    async getProfile(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
        });
    }

    async findByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async updateProfile(userId: string, data: {
        name?: string | null;
        profilePicture?: string | null;
        phone?: string | null;
        address?: string | null;
        longitude?: number | null;
        latitude?: number | null;
    }) {
        const updateData: Record<string, string | number | null> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.longitude !== undefined) updateData.longitude = data.longitude;
        if (data.latitude !== undefined) updateData.latitude = data.latitude;

        return await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
    }

    async changePassword(userId: string, newPassword: string) { 
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: newPassword
            },
        });
    }

    async redeemPoints(userId: string, points: number) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                points: {
                    decrement: points
                }
            }
        });
    }
}