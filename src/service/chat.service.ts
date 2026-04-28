import type {
    IChatService,
    ChatRequest,
    ChatResponse,
    RoomChatResponse
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
                    userId: msg.userId,
                    message: msg.content,
                    image: msg.imageUrl || undefined,
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
                                            email: true
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
}

export { ChatService };