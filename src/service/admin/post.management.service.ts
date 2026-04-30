import HttpException from "../../utils/HttpExecption.utils.js";
import { PostManagementRepository } from "../../repository/admin/post.management.repository.js";
import type { 
  IPostManagementService, 
  IPostManagementRepository,
  createPostRequest,
  UpdatePostRequest,
  PostResponse
} from "../../interface/admin/post.management.interface.js";

class PostManagementService implements IPostManagementService {
  private repository: IPostManagementRepository;

  constructor(repository: IPostManagementRepository) {
    this.repository = repository;
  }

  async getPosts(search: string = "", page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [posts, total] = await this.repository.findAll(search, skip, limit);

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async deletePost(postId: string) {
    const post = await this.repository.findById(postId);
    if (!post) throw new HttpException(404, "Post not found");

    return await this.repository.delete(postId);
  }

  async createPost(request: createPostRequest): Promise<PostResponse> {
    return await this.repository.create(request);
  }

  async updatePost(request: UpdatePostRequest): Promise<PostResponse> {
    const post = await this.repository.findById(request.id);
    if (!post) throw new HttpException(404, "Post not found");
    
    return await this.repository.update(request);
  }

  async softDeletePost(postId: string) {
    const post = await this.repository.findById(postId);
    if (!post) throw new HttpException(404, "Post not found");
    
    return await this.repository.softDelete(postId);
  }

  async createComment(postId: string, userId: string, content: string) {
    return await this.repository.createComment(postId, userId, content);
  }

  async deleteComment(commentId: string) {
    return await this.repository.deleteComment(commentId);
  }
}

export default new PostManagementService(new PostManagementRepository());
