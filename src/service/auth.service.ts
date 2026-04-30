import type {
    IAuthService,
    UserResponse,
    RegisterRequest,
    RegisterResponse,
    VerifyOTPResponse,
    LoginResponse
} from "../interface/auth.interface.js";

import { prisma } from "../database/index.js";
import HttpException from "../utils/HttpExecption.utils.js";
import JWTUtils from "../utils/jwt.utils.js";
import logger from "../utils/logger.utils.js";
import * as jwt from 'jsonwebtoken';
import { UserRepository } from "../repository/auth.repository.js";
import { PasswordUtils } from "../utils/password.utils.js";
import { Mailers } from "../mailer.service.js";

class AuthService implements IAuthService {
    constructor(
        private userRepository: UserRepository = new UserRepository()
    ) { }
    /**
     * Register: Create a stateless verification token (JWT) containing registration data and hashed OTP.
     * Sending OTP via email is handled here.
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const { email, name, password, address, phone } = data;

        // Validate email not already registered
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new HttpException(409, 'Email already registered');
        }

        // Generate OTP and hash it
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await PasswordUtils.hashPassword(otp);
        const hashedPassword = await PasswordUtils.hashPassword(password);

        // Generate stateless verification token (JWT)
        // This token contains all data needed to create the user once OTP is verified
        const verificationToken = JWTUtils.generateToken(
            {
                email,
                name,
                password: hashedPassword,
                address: address || null,
                phone: phone || null,
                hashedOtp
            },
            process.env.OTP_JWT_SECRET || 'otp-secret-key',
            '10m' // OTP valid for 10 minutes
        );

        // Send OTP email
        try {
            await Mailers.auth.sendOTPEmail(email, otp, new Date(Date.now() + 10 * 60 * 1000));
            logger.info('OTP sent via email', { email });
        } catch (mailErr) {
            logger.error('Failed to send OTP email', { email, error: String(mailErr) });
            throw new HttpException(500, 'Failed to send verification email');
        }

        return {
            verificationToken,
            message: 'OTP sent to email. Please verify within 10 minutes.'
        };
    }

    /**
     * Verify OTP: Validate OTP against the hashed value inside the verification token.
     * If valid, create the user in the database.
     */
    async verifyOTP(verificationToken: string, otpPlain: string): Promise<VerifyOTPResponse> {
        // Decode and verify the verification token
        const payload = JWTUtils.verifyToken(verificationToken, process.env.OTP_JWT_SECRET || 'otp-secret-key') as any;

        if (!payload) {
            throw new HttpException(401, 'Invalid or expired verification token. Please register again.');
        }

        const { email, name, password, address, phone, hashedOtp } = payload;

        // Verify OTP hash
        const isOTPValid = await PasswordUtils.verifyPassword(hashedOtp, otpPlain);
        if (!isOTPValid) {
            throw new HttpException(401, 'Invalid OTP');
        }

        // Double check if email was already registered (concurrency protection)
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new HttpException(409, 'Email already registered');
        }

        // Create user with stored data (password was already hashed during registration)
        const user = await this.userRepository.createUser({
            email,
            password, // already hashed
            name,
            address,
            phone,
        });

        logger.info('User registered and verified successfully', {
            userId: user.id,
            email: user.email
        });

        // Generate tokens
        const accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
        const refreshTokenSecret = process.env.REFRESH_JWT_SECRET || 'your-refresh-secret-key';
        const refreshTokenExpiresIn = process.env.REFRESH_JWT_EXPIRES_IN || '7d';

        const token = JWTUtils.generateToken(
            { userId: user.id, name: user.name, email: user.email, role: user.role },
            accessTokenSecret,
            accessTokenExpiresIn as jwt.SignOptions['expiresIn']
        );

        const refreshToken = JWTUtils.generateToken(
            { userId: user.id },
            refreshTokenSecret,
            refreshTokenExpiresIn as jwt.SignOptions['expiresIn']
        );

        // Store refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name ?? "",
                profilePicture: user.profilePicture,
                address: user.address,
                phone: user.phone,
                role: { id: 2, name: user.role },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token,
            refreshToken
        };
    }

    /**
     * Resend OTP: In a stateless flow, "resend" requires the user to submit their registration data again.
     * For better UX, we could potentially accept the old token and issue a new one if it hasn't expired yet.
     */
    async resendOTP(email: string): Promise<{ message: string }> {
        // In a strictly stateless flow with no DB/Cache, we can't 'resend' based on email alone
        // because we don't store the registration details. 
        // Suggesting the user to register again or providing a more stateful resend if needed.
        throw new HttpException(400, 'Stateless resend not supported by email alone. Please re-register.');
    }

    /**
     * Login: Validate credentials, return token
     */
    async login(email: string, passwordPlain: string): Promise<LoginResponse> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new HttpException(401, "Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await PasswordUtils.verifyPassword(user.password, passwordPlain);
        if (!isPasswordValid) {
            await prisma.user.update({
                where: { email },
                data: { login_attempt: { increment: 1 } }
            });
            throw new HttpException(401, "Invalid email or password");
        }

        // Set user to active after successful login
        await prisma.user.update({
            where: { id: user.id },
            data: { is_active: true, last_login: new Date() }
        });

        // Reset login attempts
        await this.userRepository.resetLoginAttempts(user.id);

        // Generate session tokens
        const accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
        const refreshTokenSecret = process.env.REFRESH_JWT_SECRET || 'your-refresh-secret-key';
        const refreshTokenExpiresIn = process.env.REFRESH_JWT_EXPIRES_IN || '7d';

        const token = JWTUtils.generateToken(
            {
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessTokenSecret,
            accessTokenExpiresIn as jwt.SignOptions['expiresIn']
        );

        const refreshToken = JWTUtils.generateToken(
            { userId: user.id },
            refreshTokenSecret,
            refreshTokenExpiresIn as jwt.SignOptions['expiresIn']
        );

        // Store refresh token in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        return {
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name ?? "",
                profilePicture: user.profilePicture,
                address: user.address,
                phone: user.phone,
                role: {
                    id: 2,
                    name: user.role
                },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        };
    }

    /**
     * Verify Token: Check if JWT is valid and user exists
     */
    async verifyToken(token: string): Promise<{ user: UserResponse } | null> {
        try {
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            const payload = JWTUtils.verifyToken(token, secret) as any;

            if (!payload?.userId) return null;

            const user = await this.userRepository.findById(payload.userId);
            if (!user) return null;

            return {
                user: {
                    id: user.id,
                    // uuid: user.id,
                    email: user.email,
                    name: user.name ?? "",
                    profilePicture: user.profilePicture,
                    address: user.address,
                    phone: user.phone,
                    role: {
                        id: 2,
                        name: user.role
                    },
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Logout: Handled client-side for stateless JWT, but could involve blacklisting.
     */
    async logout(token: string): Promise<void> {
        const payload = JWTUtils.verifyToken(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        if (!payload?.userId) return;
        
        // Clear refresh token from DB
        await prisma.user.update({
            where: { id: payload.userId },
            data: { refreshToken: null, is_active: false }
        });

        logger.info('User logged out successfully', {
            userId: payload.userId,
            email: payload.email
        });
    }

    async refresh(refreshToken: string): Promise<{ token: string }> {
        const secret = process.env.REFRESH_JWT_SECRET || 'your-refresh-secret-key';
        const payload = JWTUtils.verifyToken(refreshToken, secret) as any;

        if (!payload || !payload.userId) {
            throw new HttpException(401, "Invalid refresh token");
        }

        const user = await this.userRepository.findById(payload.userId);
        if (!user || user.refreshToken !== refreshToken) {
            throw new HttpException(401, "Invalid refresh token");
        }

        // Generate new access token
        const accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

        const token = JWTUtils.generateToken(
            {
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessTokenSecret,
            accessTokenExpiresIn as jwt.SignOptions['expiresIn']
        );

        return { token };
    }
}

export default new AuthService();