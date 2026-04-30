import { Router } from "express";
import PostManagementController from "../../controller/admin/post.management.controller.js";

const router = Router();

/**
 * @swagger
 * /api/admin/management/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Admin - Post Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or content
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
 *         description: Posts fetched successfully
 *   post:
 *     summary: Create a new post
 *     tags: [Admin - Post Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, type, authorId]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               type: { type: string, enum: [EDUCATION, EXCHANGE, ANNOUNCEMENT] }
 *               authorId: { type: string }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Post created successfully
 *
 * /api/admin/management/posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Admin - Post Management]
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
 *               title: { type: string }
 *               content: { type: string }
 *               type: { type: string, enum: [EDUCATION, EXCHANGE, ANNOUNCEMENT] }
 *     responses:
 *       200:
 *         description: Post updated successfully
 *   delete:
 *     summary: Permanently delete post
 *     tags: [Admin - Post Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *
 * /api/admin/management/posts/{id}/soft-delete:
 *   patch:
 *     summary: Soft delete post
 *     tags: [Admin - Post Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post soft deleted successfully
 *
 * /api/admin/management/posts/{id}/comments:
 *   post:
 *     summary: Add comment to post
 *     tags: [Admin - Post Management]
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
 *             required: [userId, content]
 *             properties:
 *               userId: { type: string }
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Comment added successfully
 *
 * /api/admin/management/posts/comments/{commentId}:
 *   delete:
 *     summary: Delete comment
 *     tags: [Admin - Post Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.get("/", PostManagementController.getPosts);
router.post("/", PostManagementController.createPost);
router.put("/:id", PostManagementController.updatePost);
router.patch("/:id/soft-delete", PostManagementController.softDeletePost);
router.delete("/:id", PostManagementController.deletePost);
router.post("/:id/comments", PostManagementController.createComment);
router.delete("/comments/:commentId", PostManagementController.deleteComment);

export default router;
