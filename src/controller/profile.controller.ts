import type { Request, Response, NextFunction } from "express";
import ProfileService from "../service/profile.service.js";
import type { 
    updateProfileRequest, 
    changePasswordRequest, 
    sendChangePasswordOTPRequest, 
    verifyChangePasswordOTPRequest 
} from "../interface/profile.interface.js";
import type { AuthenticatedUser } from "../interface/base.interface.js";

const profileService = new ProfileService();

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const result = await profileService.getProfile(userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const data: updateProfileRequest = req.body;
        const result = await profileService.updateProfile(userId, data);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const data: changePasswordRequest = req.body;
        await profileService.changePassword(userId, data);
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        next(error);
    }
};

const sendChangePasswordOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: sendChangePasswordOTPRequest = req.body;
        const result = await profileService.sendChangePasswordOTP(data);

        // Set verification token in cookie
        res.cookie('verificationToken', result.verificationToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        res.status(200).json({ message: result.message });
    } catch (error) {
        next(error);
    }
};

const verifyChangePasswordOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: verifyChangePasswordOTPRequest = req.body;
        const verificationToken = req.cookies?.verificationToken || (req as any).headers?.['verification-token'];

        if (!verificationToken) {
            return res.status(401).json({ message: "Verification token is missing or expired" });
        }

        const result = await profileService.verifyChangePasswordOTP(verificationToken, data);

        // Clear the verification cookie
        res.clearCookie('verificationToken');

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const ProfileController = {
    getProfile,
    updateProfile,
    changePassword,
    sendChangePasswordOTP,
    verifyChangePasswordOTP
};

export default ProfileController;
