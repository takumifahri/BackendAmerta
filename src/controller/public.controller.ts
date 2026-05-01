import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/index.js';
import logger from '../utils/logger.utils.js';

export const getPlatformStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logger.info('Fetching platform stats');
        
        const [userCount, donationCount, partnerCount] = await Promise.all([
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.donation.count({ where: { status: 'COMPLETED' } }),
            prisma.company.count({ where: { deletedAt: null } })
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                users: userCount,
                saved: donationCount, // Using donation count as 'saved' for now
                partners: partnerCount
            }
        });
    } catch (error) {
        next(error);
    }
};
