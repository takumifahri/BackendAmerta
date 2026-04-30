import { Router } from "express";
import UserManagementController from "../../controller/admin/user.management.controller.js";

const router = Router();

/**
 * @swagger
 * /api/admin/management/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *   post:
 *     summary: Create a new user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, role]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               role: { type: string, enum: [ADMIN, USER, COMPANY] }
 *               companyData:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   address: { type: string }
 *     responses:
 *       201:
 *         description: User created successfully
 *
 * /api/admin/management/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User fetched successfully
 *   put:
 *     summary: Update user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               role: { type: string, enum: [ADMIN, USER, COMPANY] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Permanently delete user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted successfully
 *
 * /api/admin/management/users/{id}/status:
 *   patch:
 *     summary: Update user status (active/inactive)
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Status updated successfully
 *
 * /api/admin/management/users/{id}/soft-delete:
 *   patch:
 *     summary: Soft delete user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User soft deleted successfully
 */
router.get("/", UserManagementController.getUsers);
router.get("/:id", UserManagementController.getUserById);
router.post("/", UserManagementController.createUser);
router.put("/:id", UserManagementController.updateUser);
router.patch("/:id/status", UserManagementController.updateUserStatus);
router.patch("/:id/soft-delete", UserManagementController.softDeleteUser);
router.delete("/:id", UserManagementController.deleteUser);

export default router;
