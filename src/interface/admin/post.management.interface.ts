enum PostType {
  EDUCATION = "EDUCATION",
  EXCHANGE = "EXCHANGE",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

interface createPostRequest {
  title: string;
  content: string;
  longitude?: number;
  latitude?: number;
  type: PostType;
  images: string[];
  authorId: string;
}

interface UpdatePostRequest { 
  id: string;
  title?: string;
  content?: string;
  longitude?: number;
  latitude?: number;
  type?: PostType;
  images?: string[];
}

interface DeletePostRequest {
  id: string;
}

interface PostImageResponse {
  id: string;
  url: string;
}

interface UserPostResponse {
  id: string;
  name: string;
}

interface CommentsResponse {
  id: string;
  content: string;
  authorComment: UserPostResponse;
  createdAt: Date;
}

interface PostResponse {
  id: string;
  title: string;
  content: string;
  longitude?: number | null;
  latitude?: number | null;
  type: PostType;
  images: string[];
  authorId: string;
  author: UserPostResponse;

  commentsData?: CommentsResponse[];
  imagesData?: PostImageResponse[];

  createdAt: Date;
  updatedAt: Date;
}

interface IPostManagementService {
  getPosts(search: string, page: number, limit: number): Promise<any>;
  deletePost(postId: string): Promise<any>;
  createPost(request: createPostRequest): Promise<PostResponse>;
  updatePost(request: UpdatePostRequest): Promise<PostResponse>;
  softDeletePost(postId: string): Promise<any>; 
  createComment(postId: string, userId: string, content: string): Promise<any>;
  deleteComment(commentId: string): Promise<any>;
}

interface IPostManagementRepository {
  findAll(search: string, skip: number, take: number): Promise<[any[], number]>;
  findById(id: string): Promise<any | null>;
  delete(id: string): Promise<any>;
  create(request: createPostRequest): Promise<PostResponse>;
  update(request: UpdatePostRequest): Promise<PostResponse>;
  softDelete(id: string): Promise<any>;
  createComment(postId: string, userId: string, content: string): Promise<any>;
  deleteComment(commentId: string): Promise<any>;
}

export type {
  IPostManagementService,
  IPostManagementRepository,
  createPostRequest,
  UpdatePostRequest,
  PostResponse,
  DeletePostRequest,
  PostImageResponse,
  UserPostResponse,
  CommentsResponse,
  PostType,
}