import { CommunityRepository } from '../repository/community.repository.js';
import type { CreatePostRequest } from '../interface/community.interface.js';
import HttpException from '../utils/HttpExecption.utils.js';

export class CommunityService {
    private communityRepository = new CommunityRepository();

    async getAllPosts(type?: string) {
        return await this.communityRepository.findAll(type);
    }

    async getPostById(id: string) {
        const post = await this.communityRepository.findById(id);
        if (!post) throw new HttpException(404, 'Post not found');
        return post;
    }

    async createPost(data: CreatePostRequest) {
        if (!data.title || !data.content || !data.type) {
            throw new HttpException(400, 'Title, content and type are required');
        }
        return await this.communityRepository.create(data);
    }

    async addComment(postId: string, userId: string, content: string) {
        if (!content) throw new HttpException(400, 'Comment content is required');
        return await this.communityRepository.addComment(postId, userId, content);
    }
}
