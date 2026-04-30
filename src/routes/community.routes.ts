import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as CommunityController from '../controller/community.controller.js';
import { UploadMiddleware } from '../utils/file/multerConfig.js';

const community_router = Router();

community_router.get('/', CommunityController.getAllPosts);
community_router.get('/:id', CommunityController.getPostById);

// Protected routes
community_router.post('/', authenticate, UploadMiddleware.multiple('COMMUNITY_POST', 'images'), CommunityController.createPost);
community_router.post('/:id/comment', authenticate, CommunityController.addComment);

export default community_router;
