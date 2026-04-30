import { DonationGrade, DonationType } from "../generated/prisma/client.js";
import { DonationRepository } from "../repository/donation.repository.js";

export class DonationService {
    private donationRepository: DonationRepository;

    constructor() {
        this.donationRepository = new DonationRepository();
    }

    async createDonation(userId: string, data: {
        type: DonationType;
        companyId?: string;
        description?: string;
        grade: DonationGrade;
        images?: string[];
    }) {
        // Calculate points based on grade
        let points = 0;
        switch (data.grade) {
            case DonationGrade.LAYAK:
                points = 50;
                break;
            case DonationGrade.BISA_DIPERBAIKI:
                points = 20;
                break;
            case DonationGrade.TIDAK_LAYAK:
                points = 5;
                break;
            default:
                points = 0;
        }

        return await this.donationRepository.create({
            userId,
            ...data,
            points
        });
    }

    async getUserDonations(userId: string) {
        return await this.donationRepository.findByUserId(userId);
    }

    async getCompanies() {
        return await this.donationRepository.getCompanies();
    }
}
