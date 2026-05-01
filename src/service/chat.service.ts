import type {
    IChatService,
    ChatRequest,
    ChatResponse,
    RoomChatResponse,
    isReadRequest
} from '../interface/chat.interface.js';

import { prisma } from '../database/index.js';
import HttpException from '../utils/HttpExecption.utils.js';
import logger from '../utils/logger.utils.js';
import { ChatRepository } from '../repository/chat.repository.js';

class ChatService implements IChatService {
    constructor(
        private chatRepository: ChatRepository = new ChatRepository()
    ) { }

    async getAllMessages(roomId: string): Promise<RoomChatResponse> {
        try {
            const messages = await this.chatRepository.getMessagesByRoomId(roomId);
            const userIds = Array.from(new Set(messages.map(msg => msg.userId)));

            return {
                roomId,
                messages: messages.map(msg => ({
                    id: msg.id,
                    userId: msg.userId,
                    message: msg.content,
                    image: msg.imageUrl || undefined,
                    isRead: msg.isRead,
                    timestamp: msg.createdAt
                })),
                userIds
            };
        } catch (error) {
            logger.error('Error fetching messages:', error);
            throw new HttpException(500, 'Failed to fetch messages');
        }
    }

    async sendMessage(data: ChatRequest): Promise<ChatResponse & { id?: string }> {
        try {
            const result = await this.chatRepository.createMessage({
                roomId: data.roomId,
                userId: data.userId,
                message: data.message,
                image: data.image || null
            });

            return {
                success: true,
                reply: 'Message sent successfully',
                id: result.id
            };
        } catch (error) {
            logger.error('Error sending message:', error);
            throw new HttpException(500, 'Failed to send message');
        }
    }

    async receiveMessage(data: ChatRequest): Promise<ChatResponse> {
        const response: ChatResponse = {
            success: true,
            reply: 'Message received successfully'
        };

        if (data.image !== undefined) {
            response.image = data.image;
        }

        return response;
    }

    async getUserRooms(userId: string): Promise<any[]> {
        try {
            const roomUsers = await prisma.roomUser.findMany({
                where: { userId },
                include: {
                    room: {
                        include: {
                            users: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                            is_active: true
                                        }
                                    }
                                }
                            },
                            messages: {
                                orderBy: { createdAt: 'desc' },
                                take: 1
                            }
                        }
                    }
                }
            });

            return roomUsers.map(ru => ({
                id: ru.room.id,
                type: ru.room.type,
                users: ru.room.users.map(u => u.user),
                lastMessage: ru.room.messages[0]?.content || null,
                lastMessageAt: ru.room.messages[0]?.createdAt || null
            }));
        } catch (error) {
            logger.error('Error fetching user rooms:', error);
            throw new HttpException(500, 'Failed to fetch user rooms');
        }
    }

    async isRead(data: isReadRequest): Promise<ChatResponse> {
        try {
            const message = await this.chatRepository.getMessageById(data.messageId);
            if (!message) {
                throw new HttpException(404, 'Message not found');
            }
            if (message.userId === data.userId) {
                // User cannot mark their own message as read
                return {
                    success: false,
                    reply: 'Cannot mark own message as read'
                };
            }
            await this.chatRepository.updateMessage(data.messageId, {
                isRead: true
            });
            return {
                success: true,
                reply: 'Message marked as read successfully'
            };
        } catch (error) {
            logger.error('Error marking message as read:', error);
            throw new HttpException(500, 'Failed to mark message as read');
        }
    }

    async getOrCreateRoom(data: { userId: string; targetUserId: string }): Promise<any> {
        try {
            const { userId, targetUserId } = data;

            if (userId === targetUserId) {
                throw new HttpException(400, 'Cannot chat with yourself');
            }

            // Get users roles
            const [user, targetUser] = await Promise.all([
                prisma.user.findUnique({ where: { id: userId } }),
                prisma.user.findUnique({ where: { id: targetUserId } })
            ]);

            if (!user || !targetUser) {
                throw new HttpException(404, 'User not found');
            }

            /**
             * Rules:
             * 1. USER can only chat to USER
             * 2. COMPANY can chat to USER
             * 3. COMPANY can chat to COMPANY (if user is COMPANY)
             */
            if (user.role === 'USER' && targetUser.role === 'COMPANY') {
                throw new HttpException(403, 'Users cannot initiate chat with Companies');
            }

            // Check if room already exists
            let room = await this.chatRepository.findRoomByUsers(userId, targetUserId);

            if (!room) {
                room = await this.chatRepository.createRoom(userId, targetUserId, 'USER');
            }

            return room;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            logger.error('Error getting or creating room:', error);
            throw new HttpException(500, 'Failed to get or create room');
        }
    }
}

export { ChatService };