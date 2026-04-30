import HttpException from "../../utils/HttpExecption.utils.js";
import { UserManagementRepository } from "../../repository/admin/user.management.repository.js";
import type { 
  IUserManagementService, 
  IUserManagementRepository,
  createUserRequest,
  UpdateUserRequest,
  UserResponse
} from "../../interface/admin/user.management.interface.js";

class UserManagementService implements IUserManagementService {
  private repository: IUserManagementRepository;

  constructor(repository: IUserManagementRepository) {
    this.repository = repository;
  }

  async getAllUser(search: string = "", skip: number = 0, take: number = 10) {
    const [users, total] = await this.repository.findAll(search, skip, take);
    return [users, total] as [UserResponse[], number];
  }

  async getUserById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new HttpException(404, "User not found");
    return user;
  }

  async createUser(request: createUserRequest) {
    return await this.repository.createUser(request);
  }

  async updateUser(request: UpdateUserRequest) {
    const user = await this.repository.findById(request.id);
    if (!user) throw new HttpException(404, "User not found");
    return await this.repository.updateUser(request);
  }

  async deleteUser(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new HttpException(404, "User not found");
    
    return await this.repository.deleteUser(userId);
  }

  async softDeleteUser(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new HttpException(404, "User not found");
    
    return await this.repository.softDeleteUser(userId);
  }

  async updateUserStatus(userId: string, is_active: boolean) {
    const user = await this.repository.findById(userId);
    if (!user) throw new HttpException(404, "User not found");

    return await this.repository.updateUserStatus(userId, is_active);
  }
}

export default new UserManagementService(new UserManagementRepository());
