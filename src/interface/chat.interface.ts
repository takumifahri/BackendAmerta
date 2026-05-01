interface RoomChatResponse {
    roomId: string;
    messages: Array<{
        id: string;
        userId: string;
        message: string;
        image?: string | null | undefined;
        isRead: boolean;
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

interface isReadRequest{
    userId: string;
    roomId: string;
    messageId: string;
    isRead: boolean;
}

interface InitiateChatRequest {
    userId: string;
    targetUserId: string;
}

interface IChatService {
    getAllMessages(roomId: string): Promise<RoomChatResponse>;
    sendMessage(data: ChatRequest): Promise<ChatResponse>;
    receiveMessage(data: ChatRequest): Promise<ChatResponse>;
    getUserRooms(userId: string): Promise<any[]>;
    isRead(data: isReadRequest): Promise<ChatResponse>;
    getOrCreateRoom(data: InitiateChatRequest): Promise<any>;
}

export type { ChatRequest, ChatResponse, RoomChatResponse, IChatService, isReadRequest, InitiateChatRequest };