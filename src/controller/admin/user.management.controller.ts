import type { Request, Response, NextFunction } from "express";
import UserManagementService from "../../service/admin/user.management.service.js";

class UserManagementController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const search = (req.query.search as string) || "";
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await UserManagementService.getAllUser(search, skip, limit);
      
      res.json({
        status: "success",
        message: "Users fetched successfully",
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserManagementService.getUserById(id as string);
      res.json({
        status: "success",
        message: "User fetched successfully",
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserManagementService.createUser(req.body);
      res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserManagementService.updateUser({ ...req.body, id });
      res.json({
        status: "success",
        message: "User updated successfully",
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await UserManagementService.deleteUser(id as string);
      res.json({
        status: "success",
        message: "User deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }

  async softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await UserManagementService.softDeleteUser(id as string);
      res.json({
        status: "success",
        message: "User soft deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      await UserManagementService.updateUserStatus(id as string, is_active);
      res.json({
        status: "success",
        message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new UserManagementController();
