// ========================================
// Base Interfaces - Common Response & Request
// ========================================

/**
 * Standard API Response
 * Digunakan untuk semua response dari API
 */
export interface ApiResponse<T = any> {
    status: number;
    success: boolean;
    message: string;
    data: T | null;
    timestamp: string;
}

/**
 * Paginated Response
 * Digunakan untuk response yang membutuhkan pagination
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}

/**
 * Pagination Metadata
 * Informasi detail tentang pagination
 */
export interface PaginationMeta {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Pagination Request Query
 * Parameter query untuk request yang membutuhkan pagination
 */
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Search & Filter Query
 * Parameter query untuk searching dan filtering
 */
export interface SearchQuery extends PaginationQuery {
    search?: string;
    filter?: Record<string, any>;
}

/**
 * ID Parameter
 * Untuk request yang membutuhkan ID (route params)
 */
export interface IdParam {
    id: string;
}

/**
 * Base Entity
 * Field-field umum yang ada di setiap model/entity
 */
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
}

/**
 * Error Response
 * Format response khusus untuk error
 */
export interface ErrorResponse {
    status: number;
    success: false;
    message: string;
    errors?: ValidationError[];
    timestamp: string;
}

/**
 * Validation Error Detail
 * Detail error pada saat validasi input
 */
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

/**
 * Authenticated Request
 * Data user yang sudah ter-autentikasi (dari JWT middleware)
 */
export interface AuthenticatedUser {
    userId: string;
    email: string;
    role: string;
}

/**
 * File Upload Metadata
 * Informasi file yang di-upload
 */
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    path: string;
    filename: string;
}

/**
 * Token Payload
 * Payload yang disimpan dalam JWT token
 */
export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

/**
 * Token Pair
 * Access token dan refresh token
 */
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

// ========================================
// Response Helper Types
// ========================================

/**
 * Success Response (shorthand tanpa data)
 */
export type SuccessResponse = ApiResponse<null>;

/**
 * List Response (shorthand untuk array data)
 */
export type ListResponse<T> = ApiResponse<T[]>;

// ========================================
// Enum / Constants
// ========================================

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}
