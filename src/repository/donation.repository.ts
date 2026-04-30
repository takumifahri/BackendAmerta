import { prisma } from "../database/index.js";
import type { DonationRequest, IDonationRepository } from "../interface/donation.interface.js";

export class DonationRepository implements IDonationRepository {
    async create(data: DonationRequest & { points: number }) {
        return await prisma.$transaction(async (tx) => {
            // Create the donation record
            const donation = await tx.donation.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    companyId: data.companyId,
                    description: data.description,
                    grade: data.grade,
                    points: data.points,
                    images: {
                        create: data.images?.map(url => ({ url }))
                    }
                },
                include: {
                    images: true
                }
            });

            // Update user points
            await tx.user.update({
                where: { id: data.userId },
                data: {
                    points: {
                        increment: data.points,
                    },
                },
            });

            return donation;
        });
    }

    async findByUserId(userId: string) {
        return await prisma.donation.findMany({
            where: { userId },
            include: {
                company: true,
                images: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findAll() {
        return await prisma.donation.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                company: true,
                images: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async getCompanies() {
        return await prisma.company.findMany();
    }
}
