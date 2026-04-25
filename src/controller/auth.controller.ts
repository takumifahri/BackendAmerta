import type { Request, Response, NextFunction } from "express";
import AuthService from "../service/auth.service.js";
import type { RegisterRequest, VerifyOTPRequest } from "../interface/auth.interface.js";

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: RegisterRequest = req.body;
        const result = await AuthService.register(data);

        // Set verification token in cookie
        res.cookie('verificationToken', result.verificationToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        // Remove token from response body
        const { verificationToken, ...responseBody } = result;
        res.status(200).json(responseBody);
    } catch (error) {
        next(error);
    }
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { otp }: VerifyOTPRequest = req.body;
        const verificationToken = req.body.verificationToken || req.cookies?.verificationToken;

        if (!verificationToken) {
            return res.status(400).json({ message: 'Verification token is missing or expired' });
        }

        const result = await AuthService.verifyOTP(verificationToken, otp);
        
        // Clear the verification cookie after successful verification
        res.clearCookie('verificationToken');

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const result = await AuthService.resendOTP(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        
        // Set cookie
        res.cookie('accessToken', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            await AuthService.logout(token);
        }

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/'
        });

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const result = await AuthService.verifyToken(token);
        
        if (!result) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const AuthController = {
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    me
};

export default AuthController;