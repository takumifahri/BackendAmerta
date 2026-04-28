import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import JWTUtils from './utils/jwt.utils.js';
import logger from './utils/logger.utils.js';
import Cors_Settings from './config/cors.js';
import { ChatService } from './service/chat.service.js';
import IORedis from 'ioredis';

type JoinRoomPayload = { roomId: string };
type SendMessagePayload = {
    roomId: string;
    userId: string;
    message: string;
    image?: string;
};

const chatService = new ChatService();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const Redis: any = (IORedis as any).default ?? IORedis;
export const initSocket = (httpServer: HttpServer) => {
    // Create separate pub/sub clients for Socket.IO adapter
    const pubClient = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD || undefined,
    });

    const subClient = pubClient.duplicate();

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: Cors_Settings.origin || '*',
            credentials: true,
        },
        adapter: createAdapter(pubClient, subClient),
    });

    // Authentication middleware
    io.use((socket, next) => {
        const tokenFromAuth = socket.handshake.auth?.token as string | undefined;
        const authHeader = socket.handshake.headers.authorization as string | undefined;
        
        // Try to get token from cookies
        let tokenFromCookie: string | undefined;
        const cookieHeader = socket.handshake.headers.cookie;
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
                const [key, value] = cookie.trim().split('=');
                if (key && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});
            tokenFromCookie = cookies['accessToken'];
        }

        const token =
            tokenFromAuth ||
            (authHeader ? authHeader.split(' ')[1] : undefined) ||
            tokenFromCookie;

        if (!token) {
            logger.warn('Socket connection attempt without token', { socketId: socket.id });
            return next(new Error('Unauthorized'));
        }

        try {
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            const payload = JWTUtils.verifyToken(token, secret) as any;
            if (!payload || !payload.userId) {
                logger.warn('Socket connection attempt with invalid token', { socketId: socket.id });
                return next(new Error('Unauthorized'));
            }

            socket.data.userId = payload.userId;
            socket.data.role = payload.role;
            next();
        } catch (error) {
            logger.error('Socket authentication error', { error });
            return next(new Error('Unauthorized'));
        }
    });

    // Connection handler
    io.on('connection', (socket: Socket) => {
        logger.info('Socket connected', { socketId: socket.id, userId: socket.data.userId });

        // Store user in Redis for quick lookup
        pubClient.set(`user:${socket.data.userId}:socket:${socket.id}`, '1', 'EX', 86400);

        // Join room handler
        socket.on('join_room', async (payload: JoinRoomPayload) => {
            try {
                const { roomId } = payload;
                if (!roomId) return;

                socket.join(roomId);

                // Track user in room
                pubClient.sadd(`room:${roomId}:users`, socket.data.userId);
                pubClient.set(`room:${roomId}:user:${socket.data.userId}:socket`, socket.id, 'EX', 86400);

                // Push history on join
                const history = await chatService.getAllMessages(roomId);
                socket.emit('room_history', history);

                // Notify others in room
                socket.to(roomId).emit('user_joined', {
                    userId: socket.data.userId,
                    roomId,
                    timestamp: new Date(),
                });

                logger.info('User joined room', { userId: socket.data.userId, roomId });
            } catch (error) {
                logger.error('Error in join_room', { error });
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Send message handler
        socket.on('send_message', async (payload: SendMessagePayload, ack?: (res: any) => void) => {
            try {
                if (!payload.roomId || !payload.message) {
                    ack?.({ success: false, message: 'Invalid payload' });
                    return;
                }

                // Use authenticated userId
                payload.userId = socket.data.userId;

                // Create message
                const created = await chatService.sendMessage(payload);

                // Broadcast to room
                io.to(payload.roomId).emit('new_message', {
                    roomId: payload.roomId,
                    userId: payload.userId,
                    message: payload.message,
                    image: payload.image || null,
                    timestamp: new Date(),
                    id: created?.id,
                });

                // Cache message in Redis for quick retrieval
                pubClient.lpush(
                    `room:${payload.roomId}:messages`,
                    JSON.stringify({
                        userId: payload.userId,
                        message: payload.message,
                        image: payload.image,
                        timestamp: new Date().toISOString(),
                    })
                );
                pubClient.expire(`room:${payload.roomId}:messages`, 86400); // 24 hour TTL

                ack?.({ success: true, message: 'Message sent' });
            } catch (error) {
                logger.error('Error in send_message', { error });
                ack?.({ success: false, message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', (payload: { roomId: string }) => {
            try {
                socket.to(payload.roomId).emit('user_typing', {
                    userId: socket.data.userId,
                    roomId: payload.roomId,
                });
            } catch (error) {
                logger.error('Error in typing', { error });
            }
        });

        // Stop typing
        socket.on('stop_typing', (payload: { roomId: string }) => {
            try {
                socket.to(payload.roomId).emit('user_stopped_typing', {
                    userId: socket.data.userId,
                    roomId: payload.roomId,
                });
            } catch (error) {
                logger.error('Error in stop_typing', { error });
            }
        });

        // Mark as read handler
        socket.on('mark_as_read', async (payload: { roomId: string; messageId: string }) => {
            try {
                const result = await chatService.isRead({
                    roomId: payload.roomId,
                    messageId: payload.messageId,
                    userId: socket.data.userId,
                    isRead: true
                });

                if (result.success) {
                    io.to(payload.roomId).emit('message_read', {
                        roomId: payload.roomId,
                        messageId: payload.messageId,
                        userId: socket.data.userId
                    });
                }
            } catch (error) {
                logger.error('Error in mark_as_read', { error });
            }
        });

        // Disconnect handler
        socket.on('disconnect', () => {
            // Clean up Redis
            pubClient.del(`user:${socket.data.userId}:socket:${socket.id}`);

            logger.info('Socket disconnected', { socketId: socket.id, userId: socket.data.userId });
        });

        // Error handler
        socket.on('error', (error: Error) => {
            logger.error('Socket error', { error: error.message });
        });
    });

    return io;
};