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

        if (result.token && result.refreshToken) {
            res.cookie('accessToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 60 * 60 * 1000, // 1 hour
                path: '/'
            });

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/'
            });
        }

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
        
        // Set access token cookie
        res.cookie('accessToken', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/'
        });

        // Set refresh token cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
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

        res.clearCookie('refreshToken', {
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
        // Ambil token utamanya dari cookies
        const token = req.cookies?.accessToken;
        
        if (!token) {
            return res.status(401).json({ message: 'No access token found' });
        }

        const result = await AuthService.verifyToken(token);
        
        if (!result) {
            return res.status(401).json({ message: 'Invalid or expired session' });
        }

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Ambil refresh token langsung dari cookie saja
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Session expired' });
        }

        const result = await AuthService.refresh(refreshToken);

        // Rewrite accessToken saja di cookie
        res.cookie('accessToken', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 24 * 60 * 60 * 1000, // Kita buat lebih lama (1 hari) agar stabil
            path: '/'
        });

        res.status(200).json({ status: 'success', message: 'Token refreshed' });
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
    me,
    refresh
};

export default AuthController;