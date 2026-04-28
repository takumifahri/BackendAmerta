import type { 
    IProfileService,
    UserProfileResponse,
    updateProfileRequest,
    changePasswordRequest,
    sendChangePasswordOTPRequest,
    verifyChangePasswordOTPRequest 
} from "../interface/profile.interface.js";

import { prisma } from "../database/index.js";
import HttpException from "../utils/HttpExecption.utils.js";
import JWTUtils from "../utils/jwt.utils.js";
import logger from "../utils/logger.utils.js";
import * as jwt from 'jsonwebtoken';
import { ProfileRepository } from "../repository/profile.repository.js";
import { PasswordUtils } from "../utils/password.utils.js";
import { Mailers } from "../mailer.service.js";

class ProfileService implements IProfileService {
    constructor(
        private profileRepository: ProfileRepository = new ProfileRepository()   
    ) {}

    async getProfile(userId: string): Promise<UserProfileResponse> {
        const user = await this.profileRepository.getProfile(userId);
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name ?? "",
            profilePicture: user.profilePicture,
            phone: user.phone,
            address: user.address,
            Role: user.role,
            longitude: user.longitude,
            latitude: user.latitude,
            is_verified: user.is_verified,
            last_login: user.last_login,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    async updateProfile(userId: string, data: updateProfileRequest): Promise<UserProfileResponse> {
        const updatedUser = await this.profileRepository.updateProfile(userId, data);
        if (!updatedUser) {
            throw new HttpException(404, 'User not found');
        }

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name ?? "",
            profilePicture: updatedUser.profilePicture,
            phone: updatedUser.phone,
            address: updatedUser.address,
            Role: updatedUser.role,
            longitude: updatedUser.longitude,
            latitude: updatedUser.latitude,
            is_verified: updatedUser.is_verified,
            last_login: updatedUser.last_login,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };
    }

    async changePassword(userId: string, data: changePasswordRequest): Promise<null> {
        const user = await this.profileRepository.getProfile(userId);
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const isOldPasswordValid = await PasswordUtils.comparePassword(data.old_password, user.password);
        if (!isOldPasswordValid) {
            throw new HttpException(400, 'Old password is incorrect');
        }

        if (data.new_password !== data.confirmation_password) {
            throw new HttpException(400, 'New password and confirmation password do not match');
        }

        const hashedNewPassword = await PasswordUtils.hashPassword(data.new_password);
        await this.profileRepository.changePassword(userId, hashedNewPassword);

        return null;
    }

    async sendChangePasswordOTP(data: sendChangePasswordOTPRequest): Promise<{ verificationToken: string, message: string }> {
        const { email } = data;

        // Check if user exists
        const user = await this.profileRepository.findByEmail(email);
        if (!user) {
            throw new HttpException(404, 'User with this email not found');
        }

        // Generate OTP and hash it
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await PasswordUtils.hashPassword(otp);

        // Generate stateless verification token (JWT)
        const verificationToken = JWTUtils.generateToken(
            {
                email,
                hashedOtp,
                type: 'change_password'
            },
            process.env.OTP_JWT_SECRET || 'otp-secret-key',
            '10m' // Valid for 10 minutes
        );

        // Send OTP email
        try {
            await Mailers.profile.sendChangePasswordOTP(email, otp, new Date(Date.now() + 10 * 60 * 1000));
            logger.info('Change password OTP sent via email', { email });
        } catch (mailErr) {
            logger.error('Failed to send change password OTP email', { email, error: String(mailErr) });
            throw new HttpException(500, 'Failed to send verification email');
        }

        return {
            verificationToken,
            message: 'OTP sent to email. Please verify within 10 minutes.'
        };
    }

    async verifyChangePasswordOTP(verificationToken: string, data: verifyChangePasswordOTPRequest): Promise<{ message: string }> {
        // Decode and verify the verification token
        const payload = JWTUtils.verifyToken(verificationToken, process.env.OTP_JWT_SECRET || 'otp-secret-key') as any;

        if (!payload || payload.type !== 'change_password') {
            throw new HttpException(401, 'Invalid or expired verification token.');
        }

        const { email, hashedOtp } = payload;

        // Verify OTP hash
        const isOTPValid = await PasswordUtils.verifyPassword(hashedOtp, data.otp);
        if (!isOTPValid) {
            throw new HttpException(401, 'Invalid OTP');
        }

        // Validate password confirmation
        if (data.new_password !== data.confirmation_password) {
            throw new HttpException(400, 'Passwords do not match');
        }

        // Find user
        const user = await this.profileRepository.findByEmail(email);
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        // Update password
        const hashedNewPassword = await PasswordUtils.hashPassword(data.new_password);
        await this.profileRepository.changePassword(user.id, hashedNewPassword);

        logger.info('Password reset/changed successfully via OTP', { email });

        return {
            message: 'Password has been changed successfully.'
        };
    }
}

export default ProfileService;  