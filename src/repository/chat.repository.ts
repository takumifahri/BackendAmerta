import { prisma } from '../database/index.js';

export interface IChatRepository {
    getMessagesByRoomId(roomId: string): Promise<any[]>;
    createMessage(data: {
        roomId: string;
        userId: string;
        message: string;
        image?: string | null;
    }): Promise<any>;
    getMessageById(id: string): Promise<any>;
    updateMessage(id: string, data: any): Promise<any>;
    findRoomByUsers(user1Id: string, user2Id: string): Promise<any>;
    createRoom(user1Id: string, user2Id: string, type: 'USER' | 'MARKETPLACE' | 'DONATION'): Promise<any>;
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
    async getMessageById(id: string) {
        return await prisma.message.findUnique({
            where: { id }
        });
    }

    async updateMessage(id: string, data: any) {
        return await prisma.message.update({
            where: { id },
            data
        });
    }

    async findRoomByUsers(user1Id: string, user2Id: string) {
        const rooms = await prisma.chatRoom.findMany({
            where: {
                type: 'USER',
                users: {
                    some: { userId: user1Id }
                }
            },
            include: {
                users: true
            }
        });

        return rooms.find(room => 
            room.users.length === 2 && 
            room.users.some(u => u.userId === user2Id)
        );
    }

    async createRoom(user1Id: string, user2Id: string, type: 'USER' | 'MARKETPLACE' | 'DONATION' = 'USER') {
        return await prisma.chatRoom.create({
            data: {
                type,
                users: {
                    create: [
                        { userId: user1Id },
                        { userId: user2Id }
                    ]
                }
            },
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
                }
            }
        });
    }
}