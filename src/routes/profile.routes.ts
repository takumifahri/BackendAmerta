import { Router } from 'express';
import ProfileController from '../controller/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { UploadMiddleware } from '../utils/file/multerConfig.js';

const profile_router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User ID (UUID)
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         Role:
 *           type: string
 *         langitude:
 *           type: number
 *         latitude:
 *           type: number
 *         is_verified:
 *           type: boolean
 *         last_login:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         langitude:
 *           type: number
 *         latitude:
 *           type: number
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - old_password
 *         - new_password
 *         - confirmation_password
 *       properties:
 *         old_password:
 *           type: string
 *           format: password
 *         new_password:
 *           type: string
 *           format: password
 *         confirmation_password:
 *           type: string
 *           format: password
 *     SendResetOTPRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *     VerifyResetOTPRequest:
 *       type: object
 *       required:
 *         - otp
 *         - new_password
 *         - confirmation_password
 *       properties:
 *         otp:
 *           type: string
 *         new_password:
 *           type: string
 *           format: password
 *         confirmation_password:
 *           type: string
 *           format: password
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 */
profile_router.get('/', authenticate, ProfileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Update current authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
profile_router.patch('/', authenticate, ProfileController.updateProfile);

/**
 * @swagger
 * /api/profile/change-password:
 *   post:
 *     summary: Change password using old password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid old password or password mismatch
 */
profile_router.post('/change-password', authenticate, ProfileController.changePassword);

/**
 * @swagger
 * /api/profile/reset-password/send-otp:
 *   post:
 *     summary: Send OTP for password reset (Forgot Password)
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendResetOTPRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
profile_router.post('/reset-password/send-otp', ProfileController.sendChangePasswordOTP);

/**
 * @swagger
 * /api/profile/reset-password/verify-otp:
 *   post:
 *     summary: Verify OTP and reset password
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyResetOTPRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       401:
 *         description: Invalid or expired OTP/token
 */
profile_router.post('/reset-password/verify-otp', ProfileController.verifyChangePasswordOTP);

/**
 * @swagger
 * /api/profile/upload:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 */
profile_router.post('/upload', authenticate, UploadMiddleware.single('PROFILE', 'image'), ProfileController.uploadProfilePicture);

export default profile_router;
