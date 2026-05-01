import { CommunityRepository } from '../repository/community.repository.js';
import type { CreatePostRequest, ICommunityService } from '../interface/community.interface.js';
import HttpException from '../utils/HttpExecption.utils.js';
import logger from '../utils/logger.utils.js';
import { validateCommunityContent } from '../utils/validation.utils.js';

export class CommunityService implements ICommunityService {
    private communityRepository = new CommunityRepository();

    async getAllPosts(type?: string) {
        logger.info(`Fetching all community posts${type ? ` (type: ${type})` : ''}`);
        return await this.communityRepository.findAll(type);
    }

    async getPostById(id: string) {
        logger.info(`Fetching community post: ${id}`);
        const post = await this.communityRepository.findById(id);
        if (!post) {
            logger.warn(`Community post not found: ${id}`);
            throw new HttpException(404, 'Post not found');
        }
        return post;
    }

    async createPost(data: CreatePostRequest) {
        logger.info(`Creating community post: ${data.title}`);
        if (!data.title || !data.content || !data.type) {
            logger.warn('Validation failed: Title, content, and type are required');
            throw new HttpException(400, 'Title, content and type are required');
        }
        
        // Content Validation (Gambling, Porn, Violence, Links)
        validateCommunityContent(data.title, data.content);

        const post = await this.communityRepository.create(data);
        logger.info(`Community post created successfully: ${post.id}`);
        return post;
    }

    async addComment(postId: string, userId: string, content: string) {
        logger.info(`Adding comment to post ${postId} by user ${userId}`);
        if (!content) {
            logger.warn('Validation failed: Comment content is required');
            throw new HttpException(400, 'Comment content is required');
        }

        // Content Validation for comments
        validateCommunityContent('', content);

        const comment = await this.communityRepository.addComment(postId, userId, content);
        logger.info(`Comment added successfully: ${comment.id}`);
        return comment;
    }

    async toggleLike(postId: string, userId: string) {
        logger.info(`Toggling like for post ${postId} by user ${userId}`);
        return await this.communityRepository.toggleLike(postId, userId);
    }
}
