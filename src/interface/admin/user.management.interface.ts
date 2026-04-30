enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  COMPANY = "COMPANY",
}

interface createUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  address?: string;
  phone?: string;
  profilePicture?: string;
  companyId?: string;
  is_active?: boolean;
  is_verified?: boolean;
  login_attempt?: number;
  last_login?: Date;
  refreshToken?: string;
  companyData?: companyDataRequest;
}

interface companyDataRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
}

interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  address?: string;
  phone?: string;
  profilePicture?: string;
  companyId?: string;
  is_active?: boolean;
  is_verified?: boolean;
  login_attempt?: number;
  last_login?: Date;
  refreshToken?: string;
  companyData?: companyDataRequest;
}

interface GetUserRequest {
  search?: string;
  page?: number;
  limit?: number;
}

interface DeleteUserRequest {
  id: string;
}

interface UpdateUserStatusRequest {
  id: string;
  is_active: boolean;
}

interface UserResponse{
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId: string;
  is_active: boolean;
  is_verified: boolean;
  login_attempt: number;
  last_login: Date;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  company?: CompanyDataResponse;
}

interface CompanyDataResponse {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GetUsersResponse {
  users: UserResponse[];
  total: number;
}

interface IUserManagementService {
  getAllUser(search: string, skip: number, take: number): Promise<[UserResponse[], number]>;
  getUserById(id: string): Promise<UserResponse | null>;
  createUser(request: createUserRequest): Promise<UserResponse>;
  updateUser(request: UpdateUserRequest): Promise<UserResponse>;
  deleteUser(id: string): Promise<UserResponse>;
  softDeleteUser(id: string): Promise<UserResponse>;
  updateUserStatus(id: string, is_active: boolean): Promise<UserResponse>;
}

interface IUserManagementRepository {
  findById(id: string): Promise<UserResponse | null>;
  findAll(search: string, skip: number, take: number): Promise<[UserResponse[], number]>;
  createUser(request: createUserRequest): Promise<UserResponse>;
  updateUser(request: UpdateUserRequest): Promise<UserResponse>;
  deleteUser(id: string): Promise<UserResponse>;
  updateUserStatus(id: string, is_active: boolean): Promise<UserResponse>;
  softDeleteUser(id: string): Promise<UserResponse>;
  searchUser(search: string): Promise<UserResponse[]>;
}

export type {
  createUserRequest,
  companyDataRequest,
  UpdateUserRequest,
  GetUserRequest,
  DeleteUserRequest,
  UpdateUserStatusRequest,
  UserResponse,
  CompanyDataResponse,
  GetUsersResponse,
  IUserManagementService,
  IUserManagementRepository,
};