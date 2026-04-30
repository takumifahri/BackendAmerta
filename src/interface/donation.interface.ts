import { DonationGrade, DonationType } from "../generated/prisma/client.js";

export interface DonationRequest {
    userId: string;
    type: DonationType;
    companyId?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    description?: string;
    images?: string[];
    grade: DonationGrade;
}



export interface IDonationRepository {
    create(data: DonationRequest): Promise<any>;
    findByUserId(userId: string): Promise<any[]>;
    findAll(): Promise<any[]>;
}
