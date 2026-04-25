import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import crypto from 'crypto';
import { UPLOAD_CONFIG } from '../../config/config.js';
import logger from '../logger.utils.js';

const unlinkAsync = promisify(fs.unlink);

/**
 * ✅ Directory management utilities
 */
export class DirectoryManager {
    /**
     * Ensure upload directories exist
     */
    static ensureUploadDirs(): void {
        const baseDir = path.join(process.cwd(), UPLOAD_CONFIG.BASE_DIR);

        // Create base directory
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }

        // Create subdirectories
        Object.values(UPLOAD_CONFIG.SUBDIRS).forEach(subdir => {
            const fullPath = path.join(baseDir, subdir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });

        logger.info('Upload directories ensured', {
            baseDir,
            subdirs: Object.values(UPLOAD_CONFIG.SUBDIRS)
        });
    }

    /**
     * Get directory path
     */
    static getDirectoryPath(subdir: string): string {
        return path.join(process.cwd(), UPLOAD_CONFIG.BASE_DIR, subdir);
    }
}

/**
 * ✅ File naming utilities
 */
export class FileNameGenerator {
    /**
     * Generate unique filename
     */
    static generateUniqueFileName(originalName: string): string {
        const ext = path.extname(originalName).toLowerCase();
        const timestamp = Date.now();
        const randomBytes = crypto.randomBytes(6).toString('hex');
        return `${timestamp}-${randomBytes}${ext}`;
    }

    /**
     * Generate filename variants
     */
    static generateVariantNames(baseName: string, format: string = 'jpg'): {
        thumbnail: string;
        medium: string;
        original: string;
    } {
        const name = path.parse(baseName).name;
        return {
            thumbnail: `${name}_thumb.${format}`,
            medium: `${name}_medium.${format}`,
            original: `${name}_original.${format}`
        };
    }
}

/**
 * ✅ Path utilities
 */
export class PathUtils {
    /**
     * Get file path
     */
    static getFilePath(subdir: string, filename: string): string {
        return path.join(process.cwd(), UPLOAD_CONFIG.BASE_DIR, subdir, filename);
    }

    /**
     * Get public URL for file - ✅ Keep /uploads for database storage
     */
    static getFileUrl(subdir: string, filename: string): string {
        return `/uploads/${subdir}/${filename}`;
    }

    /**
     * Convert URL to file path - ✅ Handle /uploads URLs directly
     */
    static urlToFilePath(fileUrl: string): string {
        const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
        // No replacement needed since URL already matches physical structure
        return path.join(process.cwd(), relativePath);
    }
}

/**
 * ✅ File validation utilities
 */
export class FileValidator {
    /**
     * Validate file type
     */
    static validateFileType(file: Express.Multer.File, allowedTypes: readonly string[]): boolean {
        return allowedTypes.includes(file.mimetype);
    }

    /**
     * Validate image file
     */
    static validateImageFile(file: Express.Multer.File): boolean {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        return (
            this.validateFileType(file, UPLOAD_CONFIG.ALLOWED_TYPES.IMAGES) &&
            allowedExtensions.includes(fileExtension)
        );
    }

    /**
     * Validate document file
     */
    static validateDocumentFile(file: Express.Multer.File): boolean {
        return this.validateFileType(file, UPLOAD_CONFIG.ALLOWED_TYPES.DOCUMENTS);
    }

    /**
     * Validate file size
     */
    static validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
        return file.size <= maxSize;
    }
}

/**
 * ✅ File cleanup utilities
 */
export class FileCleanup {
    /**
     * Delete single file by path
     */
    static async deleteFile(filePath: string): Promise<void> {
        try {
            if (fs.existsSync(filePath)) {
                await unlinkAsync(filePath);
                logger.info('File deleted successfully', { filePath });
            }
        } catch (error: any) {
            logger.error('Error deleting file', {
                filePath,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Delete file by URL
     */
    static async deleteFileByUrl(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        const filePath = PathUtils.urlToFilePath(fileUrl);
        await this.deleteFile(filePath);
    }

    /**
     * Delete multiple files
     */
    static async deleteFiles(filePaths: string[]): Promise<void> {
        const deletePromises = filePaths.map(filePath =>
            this.deleteFile(filePath).catch(error => {
                logger.warn('Failed to delete file, continuing...', {
                    filePath,
                    error: error.message
                });
            })
        );

        await Promise.all(deletePromises);
    }

    /**
     * Delete image variants (thumbnail, medium, original)
     */
    static async deleteImageVariants(baseUrl: string): Promise<void> {
        if (!baseUrl) return;

        const baseName = path.parse(baseUrl).name.replace(/_(thumb|medium|original)$/, '');
        const urlParts = baseUrl.split('/');
        const subdir = urlParts.length >= 3 ? urlParts[2] : '';

        if (!subdir) return;

        const variants = [
            PathUtils.getFileUrl(subdir, `${baseName}_thumb.jpg`),
            PathUtils.getFileUrl(subdir, `${baseName}_medium.jpg`),
            PathUtils.getFileUrl(subdir, `${baseName}_original.jpg`)
        ];

        await Promise.all(variants.map(url =>
            this.deleteFileByUrl(url).catch(() => { }) // Ignore errors
        ));
    }

    /**
     * Cleanup uploaded files on error
     */
    static async cleanupUploadedFiles(files: Express.Multer.File[]): Promise<void> {
        const filePaths = files.map(file => file.path);
        await this.deleteFiles(filePaths);
    }
}