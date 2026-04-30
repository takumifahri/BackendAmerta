import type { CompanyDataResponse, UserResponse } from "./admin/user.management.interface.js";

export enum DonationGrade {
    LAYAK = "LAYAK",
    TIDAK_LAYAK = "TIDAK_LAYAK",
    BISA_DIPERBAIKI = "BISA_DIPERBAIKI"
}

export enum DonationType {
    COMPANY = "COMPANY",
    AMERTA = "AMERTA"
}

export enum DonationStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ONGOING = "ONGOING"
}

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
    status: DonationStatus.PENDING;
}

export interface UpdateDonationRequest {
    id: string;
    type?: DonationType;
    companyId?: string;
    description?: string;
    grade?: DonationGrade;
    images?: string[];
    status?: DonationStatus;
}

export interface DonationResponse {
    id: string;
    userId: string;
    type: DonationType;
    companyId?: string;
    description?: string;
    grade: DonationGrade;
    points: number;
    images: string[];
    company?: CompanyDataResponse[]
    user?: UserResponse[]
    status: DonationStatus;
    createdAt: Date;
}

export interface AllDonationResponse {
    id: string;
    userId: string;
    type: DonationType;
    companyId?: string;
    description?: string;
    grade: DonationGrade;
    points: number;
    images: string[];
    company?: CompanyDataResponse[]
    user?: UserResponse[]
    status: DonationStatus;
    createdAt: Date;
}

export interface UpdateStatusDonationRequest {
    id: string;
    status: DonationStatus;
}

export interface IDonationRepository {
    create(data: DonationRequest): Promise<any>;
    update(data: UpdateDonationRequest): Promise<any>;
    findByUserId(userId: string): Promise<any[]>;
    findAll(): Promise<any[]>;
    updateStatus(data: UpdateStatusDonationRequest): Promise<any>;
}

export interface IDonationService {
    create(data: DonationRequest): Promise<any>;
    update(data: UpdateDonationRequest): Promise<any>;
    findByUserId(userId: string): Promise<any[]>;
    findAll(): Promise<any[]>;
    findAllCompleted(): Promise<any[]>;
    findAllOngoing(): Promise<any[]>;
    findAllCancelled(): Promise<any[]>;
    findAllPending(): Promise<any[]>;
    delete(id: string): Promise<any>;
    softDelete(id: string): Promise<any>;
    updateStatus(data: UpdateStatusDonationRequest): Promise<any>;
}   