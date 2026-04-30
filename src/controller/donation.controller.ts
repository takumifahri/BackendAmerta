import type { Request, Response, NextFunction } from "express";
import { DonationService } from "../service/donation.service.js";
import { DonationGrade, DonationType, DonationStatus } from "../interface/donation.interface.js";

export class DonationController {
    private donationService: DonationService;

    constructor() {
        this.donationService = new DonationService();
    }

    createDonation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId;
            const { type, companyId, description, grade } = req.body;
            
            const files = req.files as Express.Multer.File[];
            const imageUrls = files?.map(file => `/storage/uploads/donation-images/${file.filename}`) || [];

            const result = await this.donationService.create({
                userId,
                type: type as DonationType,
                companyId,
                description,
                grade: grade as DonationGrade,
                images: imageUrls,
                status: DonationStatus.PENDING
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
            const result = await this.donationService.findByUserId(userId);

            res.status(200).json({
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getAllDonations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status } = req.query;
            let result;
            
            if (status === DonationStatus.COMPLETED) result = await this.donationService.findAllCompleted();
            else if (status === DonationStatus.ONGOING) result = await this.donationService.findAllOngoing();
            else if (status === DonationStatus.CANCELLED) result = await this.donationService.findAllCancelled();
            else if (status === DonationStatus.PENDING) result = await this.donationService.findAllPending();
            else result = await this.donationService.findAll();

            res.status(200).json({
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    updateDonationStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const result = await this.donationService.updateStatus({
                id: id as string,
                status: status as DonationStatus
            });

            res.status(200).json({
                message: "Donation status updated successfully",
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
