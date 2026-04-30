import type { 
    DonationRequest, 
    IDonationService, 
    UpdateDonationRequest, 
    UpdateStatusDonationRequest 
} from "../interface/donation.interface.js";
import { DonationRepository } from "../repository/donation.repository.js";
import { DonationGrade, DonationStatus } from "../interface/donation.interface.js";

export class DonationService implements IDonationService {
    private donationRepository: DonationRepository;

    constructor() {
        this.donationRepository = new DonationRepository();
    }

    async create(data: DonationRequest) {
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
            ...data,
            points
        });
    }

    async update(data: UpdateDonationRequest) {
        return await this.donationRepository.update(data);
    }

    async findByUserId(userId: string) {
        return await this.donationRepository.findByUserId(userId);
    }

    async findAll() {
        return await this.donationRepository.findAll();
    }

    async findAllCompleted() {
        return await this.donationRepository.findAll(DonationStatus.COMPLETED);
    }

    async findAllOngoing() {
        return await this.donationRepository.findAll(DonationStatus.ONGOING);
    }

    async findAllCancelled() {
        return await this.donationRepository.findAll(DonationStatus.CANCELLED);
    }

    async findAllPending() {
        return await this.donationRepository.findAll(DonationStatus.PENDING);
    }

    async delete(id: string) {
        return await this.donationRepository.delete(id);
    }

    async softDelete(id: string) {
        return await this.donationRepository.softDelete(id);
    }

    async updateStatus(data: UpdateStatusDonationRequest) {
        return await this.donationRepository.updateStatus(data);
    }

    async getCompanies() {
        return await this.donationRepository.getCompanies();
    }
}
