import { prisma } from '../database/index.js';

export interface IChatRepository {
    getMessagesByRoomId(roomId: string): Promise<any[]>;
    createMessage(data: {
        roomId: string;
        userId: string;
        message: string;
        image?: string | null;
    }): Promise<any>;
}

export class ChatRepository implements IChatRepository {
    async getMessagesByRoomId(roomId: string) {
        const messages = await prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' },
            take: 50
        });

        return messages.map(msg => ({
            ...msg,
            image: msg.imageUrl
        }));
    }

    async createMessage(data: {
        roomId: string;
        userId: string;
        message: string;
        image?: string | null;
    }) {
        return await prisma.message.create({
            data: {
                roomId: data.roomId,
                userId: data.userId,
                content: data.message,
                imageUrl: data.image || null,
                type: data.image ? 'IMAGE' : 'TEXT'
            }
        });
    }
}