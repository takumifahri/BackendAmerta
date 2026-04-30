import { prisma } from "../database/index.js";
import type { 
    DonationRequest, 
    IDonationRepository, 
    UpdateDonationRequest, 
    UpdateStatusDonationRequest 
} from "../interface/donation.interface.js";
import { DonationStatus } from "../interface/donation.interface.js";

export class DonationRepository implements IDonationRepository {
    async create(data: DonationRequest & { points: number }) {
        return await prisma.$transaction(async (tx) => {
            // Create the donation record
            const donation = await tx.donation.create({
                data: {
                    userId: data.userId,
                    type: data.type as any,
                    companyId: (data.companyId && data.companyId.trim() !== "") ? data.companyId : null,
                    description: data.description ?? null,
                    grade: data.grade as any,
                    points: data.points,
                    status: data.status as any,
                    ...(data.images && data.images.length > 0 ? {
                        images: {
                            create: data.images.map(url => ({ url }))
                        }
                    } : {})
                },
                include: {
                    images: true
                }
            });

            // Points are NOT added here anymore. They are added when status becomes COMPLETED.
            return donation;
        });
    }

    async update(data: UpdateDonationRequest) {
        const { id, images, ...updateData } = data;
        
        return await prisma.$transaction(async (tx) => {
            if (images) {
                // Delete old images and create new ones
                await tx.donationImage.deleteMany({
                    where: { donationId: id }
                });
                await tx.donationImage.createMany({
                    data: images.map(url => ({ url, donationId: id }))
                });
            }

            return await tx.donation.update({
                where: { id },
                data: {
                    ...(updateData as any),
                    companyId: (updateData.companyId && updateData.companyId.trim() !== "") ? updateData.companyId : (updateData.companyId === "" ? null : undefined)
                },
                include: {
                    images: true,
                    company: true,
                }
            });
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

    async findAll(status?: any) {
        return await prisma.donation.findMany({
            where: status ? { status } : {},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true,
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

    async updateStatus(data: UpdateStatusDonationRequest) {
        return await prisma.$transaction(async (tx) => {
            // Get current donation to check status and points
            const currentDonation = await tx.donation.findUnique({
                where: { id: data.id },
            });

            if (!currentDonation) {
                throw new Error("Donation not found");
            }

            // Only increment points if changing from non-COMPLETED to COMPLETED
            if (data.status === DonationStatus.COMPLETED && currentDonation.status !== DonationStatus.COMPLETED) {
                await tx.user.update({
                    where: { id: currentDonation.userId },
                    data: {
                        points: {
                            increment: currentDonation.points,
                        },
                    },
                });
            }
            
            // Note: If changing FROM COMPLETED to something else, we might want to decrement points.
            // But usually admin approval is final.

            return await tx.donation.update({
                where: { id: data.id },
                data: {
                    status: data.status as any
                }
            });
        });
    }

    async getCompanies() {
        return await prisma.company.findMany();
    }

    async delete(id: string) {
        return await prisma.donation.delete({
            where: { id }
        });
    }

    async softDelete(id: string) {
        return await prisma.donation.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });
    }
}
