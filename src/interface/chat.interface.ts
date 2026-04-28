interface RoomChatResponse {
    roomId: string;
    messages: Array<{
        userId: string;
        message: string;
        image?: string | null | undefined;
        timestamp: Date;
    }>;
    userIds: string[];
}

interface ChatRequest {
    roomId: string;
    userId: string;
    message: string;
    image?: string | null | undefined;
}

interface ChatResponse {
    success: boolean;
    reply: string;
    image?: string | null | undefined;
}

interface IChatService {
    getAllMessages(roomId: string): Promise<RoomChatResponse>;
    sendMessage(data: ChatRequest): Promise<ChatResponse>;
    receiveMessage(data: ChatRequest): Promise<ChatResponse>;
    getUserRooms(userId: string): Promise<any[]>;
}

export type { ChatRequest, ChatResponse, RoomChatResponse, IChatService };