import { Router } from "express";
import { DonationController } from "../controller/donation.controller.js";
import { authenticate, checkRole } from "../middleware/auth.middleware.js";
import { UploadMiddleware } from "../utils/file/multerConfig.js";

const donation_router = Router();
const donationController = new DonationController();

/**
 * @swagger
 * tags:
 *   name: Donation
 *   description: Donation management
 */

/**
 * @swagger
 * /api/donation:
 *   post:
 *     summary: Create a new donation
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [COMPANY, AMERTA]
 *               companyId:
 *                 type: string
 *               description:
 *                 type: string
 *               grade:
 *                 type: string
 *                 enum: [LAYAK, TIDAK_LAYAK, BISA_DIPERBAIKI]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Donation created successfully
 */
donation_router.post(
    "/", 
    authenticate, 
    UploadMiddleware.multiple('DONATION_IMAGES', 'images'),
    donationController.createDonation
);

/**
 * @swagger
 * /api/donation/my:
 *   get:
 *     summary: Get current user's donations
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user donations
 */
donation_router.get("/my", authenticate, donationController.getUserDonations);

/**
 * @swagger
 * /api/donation/companies:
 *   get:
 *     summary: Get all companies for donation
 *     tags: [Donation]
 *     responses:
 *       200:
 *         description: List of companies
 */
donation_router.get("/companies", donationController.getCompanies);

/**
 * @swagger
 * /api/donation/all:
 *   get:
 *     summary: Get all donations (Admin only)
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ONGOING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: List of all donations
 */
donation_router.get("/all", authenticate, checkRole(["ADMIN"]), donationController.getAllDonations);

/**
 * @swagger
 * /api/donation/{id}/status:
 *   patch:
 *     summary: Update donation status (Admin only)
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, ONGOING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Donation status updated successfully
 */
donation_router.patch("/:id/status", authenticate, checkRole(["ADMIN"]), donationController.updateDonationStatus);

export default donation_router;
