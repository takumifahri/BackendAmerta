import { prisma } from "../../database/index.js";
import type { 
  createUserRequest,
  UpdateUserRequest,
  UserResponse,
  IUserManagementRepository,
} from "../../interface/admin/user.management.interface.js";

export class UserManagementRepository implements IUserManagementRepository {
  async findById(id: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: true
      }
    });
    return user as unknown as UserResponse;
  }

  async findAll(search: string, skip: number, take: number): Promise<[UserResponse[], number]> {
    const where: any = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return [users as unknown as UserResponse[], total];
  }

  async createUser(request: createUserRequest): Promise<UserResponse> {
    const { companyData, companyId, ...userData } = request;
    const user = await prisma.user.create({
      data: {
        ...userData,
        ...(companyData ? {
          company: {
            create: companyData
          }
        } : companyId ? {
          company: {
            connect: { id: companyId }
          }
        } : {})
      },
      include: {
        company: true
      }
    });
    return user as unknown as UserResponse;
  }

  async updateUser(request: UpdateUserRequest): Promise<UserResponse> {
    const { id, companyData, companyId, ...userData } = request;
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(companyData ? {
          company: {
            update: companyData
          }
        } : companyId ? {
          company: {
            connect: { id: companyId }
          }
        } : {})
      },
      include: {
        company: true
      }
    });
    return user as unknown as UserResponse;
  }

  async deleteUser(id: string): Promise<UserResponse> {
    const user = await prisma.user.delete({
      where: { id },
      include: {
        company: true
      }
    });
    return user as unknown as UserResponse;
  }

  async updateUserStatus(id: string, is_active: boolean): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: { is_active },
      include: {
        company: true
      }
    });
    return user as unknown as UserResponse;
  }

  async softDeleteUser(id: string): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: { is_active: false },
      include: {
        company: true
      }
    });
    return user as unknown as UserResponse;
  }

  async searchUser(search: string): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      },
      include: {
        company: true
      }
    });
    return users as unknown as UserResponse[];
  }
}