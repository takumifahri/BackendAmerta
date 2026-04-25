import type { ApiResponse } from "./base.interface.js"

// DTO and Interfaces
enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
    COMPANY = 'COMPANY'
}

export interface loginRequest {
    email : string,
    password : string
}

// For OTP Sendng email
export interface registerRequest {
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
export interface UserAuthResponse { 
    id : string,
    email : string,
    role : Role,
    phone? : string,
    address? : string,
    
    langitude? : number,
    latitude? : number,

    companyData? : CompanyAuthResponse[]

    createdAt : Date,
    updatedAt? : Date,
}
export interface RegisterResponse {
    verificationId: number;
    message: string;
}

export interface VerifyOTPRequest {
    verificationId: number;
    otp: string;
}
export interface VerifyOTPResponse {
    user: UserAuthResponse;
}

export interface ResendOTPRequest {
    email: string;
}
export interface AuthInterface {
    login(request: loginRequest): Promise<ApiResponse<UserAuthResponse>>
    register(request: registerRequest): Promise<ApiResponse<RegisterResponse>>
    verifyOTP(request: VerifyOTPRequest): Promise<ApiResponse<UserAuthResponse>>
    resendOTP(request: ResendOTPRequest): Promise<ApiResponse<{ message: string }>>
    logout(token: string): Promise<void>;
}