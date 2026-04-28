export interface CreatePostRequest {
    title: string;
    content: string;
    type: 'EDUCATION' | 'EXCHANGE' | 'ANNOUNCEMENT';
    images?: string[];
    latitude?: number;
    longitude?: number;
    authorId: string;
}

export interface PostResponse {
    id: string;
    title: string;
    content: string;
    type: string;
    images: { id: string; url: string }[];
    latitude: number | null;
    longitude: number | null;
    author: {
        id: string;
        name: string;
    };
    comments: CommentResponse[];
    createdAt: Date;
}

export interface CommentResponse {
    id: string;
    content: string;
    user: {
        id: string;
        name: string;
    };
    createdAt: Date;
}
