import { Request, Response, NextFunction } from "express";
import { DonationService } from "../service/donation.service.js";
import { DonationGrade, DonationType } from "../generated/prisma/client.js";

export class DonationController {
    private donationService: DonationService;

    constructor() {
        this.donationService = new DonationService();
    }

    createDonation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId; // Matches other controllers
            const { type, companyId, description, grade } = req.body;
            
            const files = req.files as Express.Multer.File[];
            const imageUrls = files?.map(file => `/storage/uploads/donation-images/${file.filename}`) || [];

            const result = await this.donationService.createDonation(userId, {
                type: type as DonationType,
                companyId,
                description,
                grade: grade as DonationGrade,
                images: imageUrls
            });

            res.status(201).json({
                message: "Donation created successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getUserDonations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId;
            const result = await this.donationService.getUserDonations(userId);

            res.status(200).json({
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getCompanies = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.donationService.getCompanies();
            res.status(200).json({
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
