export interface CreatePostRequest {
    title: string;
    content: string;
    type: 'EDUCATION' | 'EXCHANGE' | 'ANNOUNCEMENT';
    images?: string[];
    latitude?: number;
    longitude?: number;
    address?: string;
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
export interface ICommunityRepository {
    findAll(type?: string): Promise<any[]>;
    findById(id: string): Promise<any | null>;
    create(data: CreatePostRequest): Promise<any>;
    addComment(postId: string, userId: string, content: string): Promise<any>;
}

export interface ICommunityService {
    getAllPosts(type?: string): Promise<any[]>;
    getPostById(id: string): Promise<any | null>;
    createPost(data: CreatePostRequest): Promise<any>;
    addComment(postId: string, userId: string, content: string): Promise<any>;
}