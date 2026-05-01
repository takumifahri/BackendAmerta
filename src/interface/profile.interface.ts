import { Role } from "../generated/prisma/enums.js";
import type { ApiResponse } from "./base.interface.js";

// DTO and Interfaces
interface UserProfileResponse {
    id : string,
    email : string,
    name : string,
    profilePicture? : string | null,
    phone? : string | null,
    address? : string | null,
    Role : Role,
    

    // Detail Landmark
    longitude? : number | null,
    latitude? : number | null,

    // Status
    is_verified : boolean,
    last_login? : Date | null,
    points : number,

    createdAt : Date,
    updatedAt? : Date | null,
}

interface updateProfileRequest {
    name? : string,
    profilePicture? : string,
    phone? : string,
    address? : string,

    // Detail Landmark
    longitude? : number | null,
    latitude? : number | null,
}

// Change password if user remember old password
interface changePasswordRequest {
    old_password : string,
    new_password : string,
    confirmation_password : string
}

// Reset password if user forget old password, using OTP
interface sendChangePasswordOTPRequest {
    email : string,
}

// It will verify the OTP and change the password if OTP is valid and the token is stateless on the cookies
interface verifyChangePasswordOTPRequest {
    otp : string,
    new_password : string,
    confirmation_password : string
}

interface redeemPointsRequest {
    rewardId: number;
    rewardTitle: string;
    cost: number;
}

interface IProfileService {
    getProfile(userId : string) : Promise<UserProfileResponse>,
    updateProfile(userId : string, data : updateProfileRequest) : Promise<UserProfileResponse>,
    changePassword(userId : string, data : changePasswordRequest) : Promise<null>,
    sendChangePasswordOTP(data : sendChangePasswordOTPRequest) : Promise<{ verificationToken: string, message: string }>,
    verifyChangePasswordOTP(verificationToken: string, data : verifyChangePasswordOTPRequest) : Promise<{ message: string }>,
    redeemPoints(userId: string, data: redeemPointsRequest): Promise<UserProfileResponse>;
}

export type {
    UserProfileResponse,
    updateProfileRequest,
    changePasswordRequest,
    sendChangePasswordOTPRequest,
    verifyChangePasswordOTPRequest,
    redeemPointsRequest,
    IProfileService
}