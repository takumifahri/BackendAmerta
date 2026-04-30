import type { Request, Response, NextFunction } from "express";
import PostManagementService from "../../service/admin/post.management.service.js";

class PostManagementController {
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;
      const data = await PostManagementService.getPosts(
        (search as string) || "",
        Number(page) || 1,
        Number(limit) || 10
      );
      res.json({
        status: "success",
        message: "Posts fetched successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await PostManagementService.deletePost(id as string);
      res.json({
        status: "success",
        message: "Post deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await PostManagementService.createPost(req.body);
      res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: post
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await PostManagementService.updatePost({ ...req.body, id });
      res.json({
        status: "success",
        message: "Post updated successfully",
        data: post
      });
    } catch (err) {
      next(err);
    }
  }

  async softDeletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await PostManagementService.softDeletePost(id as string);
      res.json({
        status: "success",
        message: "Post soft deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: postId } = req.params;
      const { userId, content } = req.body;
      const comment = await PostManagementService.createComment(postId as string, userId as string, content as string);
      res.status(201).json({
        status: "success",
        message: "Comment created successfully",
        data: comment
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      await PostManagementService.deleteComment(commentId as string);
      res.json({
        status: "success",
        message: "Comment deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new PostManagementController();
