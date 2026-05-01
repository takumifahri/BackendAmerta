import type { Request, Response, NextFunction } from 'express';
import { CommunityService } from '../service/community.service.js';

const communityService = new CommunityService();

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.query.type as string | undefined;
        const posts = await communityService.getAllPosts(type);
        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const post = await communityService.getPostById(id);
        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorId = (req as any).user?.userId;
        const files = req.files as Express.Multer.File[];
        
        // Sesuaikan dengan static path di app.ts yaitu /storage/uploads
        const imageUrls = files?.map(file => `/storage/uploads/community-post/${file.filename}`) || [];

        // Parsing data numerik dari FormData (yang selalu string)
        const latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
        const longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;

        const result = await communityService.createPost({ 
            ...req.body, 
            authorId,
            latitude,
            longitude,
            images: imageUrls
        });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id as string;
        const userId = (req as any).user?.userId;
        const content = req.body.content as string;
        const result = await communityService.addComment(postId, userId, content);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id as string;
        const userId = (req as any).user?.userId;
        const result = await communityService.toggleLike(postId, userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
