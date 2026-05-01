import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getRoomMessages, sendMessageREST, getRoomUsers, getUserRooms, initiateChat } from '../controller/chat.controller.js';

const chatRouter = Router();

/**
 * @swagger
 * /api/chat/rooms:
 *   get:
 *     summary: Get user's chat rooms
 *     description: Retrieve all chat rooms that the authenticated user is a participant in.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User rooms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum: [USER, MARKETPLACE, DONATION]
 *                       users:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                       lastMessage:
 *                         type: string
 *                         nullable: true
 *                       lastMessageAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
chatRouter.get('/rooms', authenticate, getUserRooms);

/**
 * @swagger
 * /api/chat/{roomId}/messages:
 *   get:
 *     summary: Get room message history
 *     description: Retrieve all messages from a specific chat room. Returns up to 50 most recent messages.
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the chat room
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     roomId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                             example: "user-123"
 *                           message:
 *                             type: string
 *                             example: "Hello, how are you?"
 *                           image:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-04-28T10:30:00Z"
 *                     userIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["user-123", "user-456"]
 *       400:
 *         description: Invalid roomId provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Invalid roomId"
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error while fetching messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch room messages"
 */
chatRouter.get('/:roomId/messages', authenticate, getRoomMessages);

/**
 * @swagger
 * /api/chat/{roomId}/users:
 *   get:
 *     summary: Get active users in room
 *     description: Retrieve list of all users who have participated in messages in a specific chat room
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the chat room
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Room users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 roomId:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 userCount:
 *                   type: integer
 *                   example: 3
 *                 userIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["user-123", "user-456", "user-789"]
 *       400:
 *         description: Invalid roomId provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Invalid roomId"
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error while fetching room users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch room users"
 */
chatRouter.get('/:roomId/users', authenticate, getRoomUsers);

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send message via REST endpoint
 *     description: Send a text message to a chat room (WebSocket preferred for real-time). This is a fallback REST endpoint for sending messages.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - message
 *             properties:
 *               roomId:
 *                 type: string
 *                 format: uuid
 *                 description: The unique identifier of the target chat room
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               message:
 *                 type: string
 *                 description: The content of the message to send
 *                 example: "Hello, this is a test message!"
 *               image:
 *                 type: string
 *                 nullable: true
 *                 description: Optional URL or path to an image attachment
 *                 example: null
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     reply:
 *                       type: string
 *                       example: "Message sent successfully"
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "msg-123e4567-e89b"
 *       400:
 *         description: Invalid request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "roomId and message are required"
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error while sending message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to send message"
 */
chatRouter.post('/send', authenticate, sendMessageREST);
chatRouter.post('/rooms/initiate', authenticate, initiateChat);

export default chatRouter;