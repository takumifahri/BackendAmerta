import type { ApiResponse } from "./base.interface.js"

// DTO and Interfaces
export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
    COMPANY = 'COMPANY'
}

export interface loginRequest {
    email : string,
    password : string
}

// For OTP Sendng email
export interface RegisterRequest {
    name : string,
    email: string,
    password : string,
    role? : Role | Role.USER,
    phone : string,
    address? :string
    companyData? : CompanyAuthRequest[]
}

export interface CompanyAuthRequest {
    name? : string,
    address? :string,
    phone? : string,
    email? : string,
    website? : string,
    description? : string,
}

export interface CompanyAuthResponse {
    id : string,
    name : string,
    address? :string,
    phone? : string,
    email? : string,
    website? : string,
    description? : string,
}

export interface UserResponse { 
    id : string,
    // uuid : string;
    email : string;
    name : string;
    phone? : string | null;
    address? : string | null;
    role : {
        id: number;
        name: string;
    };
    createdAt : Date;
    updatedAt? : Date | null;
}

export interface RegisterResponse {
    verificationToken?: string;
    message: string;
}

export interface VerifyOTPRequest {
    verificationToken?: string;
    otp: string;
}

export interface VerifyOTPResponse {
    user: UserResponse;
    token?: string;
}

export interface ResendOTPRequest {
    email: string;
}

export interface LoginResponse {
    token: string;
    user: UserResponse;
}

export interface IAuthService {
    login(email: string, passwordPlain: string): Promise<LoginResponse>;
    register(data: RegisterRequest): Promise<RegisterResponse>;
    verifyOTP(verificationToken: string, otpPlain: string): Promise<VerifyOTPResponse>;
    resendOTP(email: string): Promise<{ message: string }>;
    logout(token: string): Promise<void>;
    verifyToken(token: string): Promise<{ user: UserResponse } | null>;
}