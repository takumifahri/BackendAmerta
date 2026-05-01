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
        res.status(200).json({
            status: 200,
            success: true,
            message: "Profile retrieved successfully",
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const data: updateProfileRequest = req.body;
        const result = await profileService.updateProfile(userId, data);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Profile updated successfully",
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const data: changePasswordRequest = req.body;
        await profileService.changePassword(userId, data);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Password updated successfully",
            data: null,
            timestamp: new Date().toISOString()
        });
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

        res.status(200).json({
            status: 200,
            success: true,
            message: result.message,
            data: null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

const verifyChangePasswordOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: verifyChangePasswordOTPRequest = req.body;
        const verificationToken = req.cookies?.verificationToken || (req as any).headers?.['verification-token'];

        if (!verificationToken) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: "Verification token is missing or expired",
                data: null,
                timestamp: new Date().toISOString()
            });
        }

        const result = await profileService.verifyChangePasswordOTP(verificationToken, data);

        // Clear the verification cookie
        res.clearCookie('verificationToken');

        res.status(200).json({
            status: 200,
            success: true,
            message: result.message,
            data: null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "No file uploaded",
                data: null,
                timestamp: new Date().toISOString()
            });
        }

        // Return the relative path for storage
        const fileUrl = `/storage/uploads/profiles/${file.filename}`;

        // Save to DB immediately
        const result = await profileService.updateProfile(userId, { profilePicture: fileUrl });

        res.status(200).json({
            status: 200,
            success: true,
            message: "Profile picture updated successfully",
            data: {
                url: fileUrl,
                user: result
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.q as string || "";
        const userId = (req as any).user.userId;
        const users = await profileService.searchUsers(query, userId);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Users retrieved successfully",
            data: users,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

const redeemPoints = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const data = req.body;
        const result = await profileService.redeemPoints(userId, data);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Points redeemed successfully",
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};



const ProfileController = {
    getProfile,
    updateProfile,
    changePassword,
    sendChangePasswordOTP,
    verifyChangePasswordOTP,
    uploadProfilePicture,
    searchUsers,
    redeemPoints
};


export default ProfileController;
