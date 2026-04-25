import sharp from 'sharp';
import path from 'path';
import { UPLOAD_CONFIG } from '../../config/config.js';
import { PathUtils, FileNameGenerator, FileCleanup, DirectoryManager } from './fileUtils.js';
import logger from '../logger.utils.js';

export interface ImageVariants {
    thumbnail: string;
    medium: string;
    original: string;
}

export interface ImageMetadata {
    original_url: string;
    medium_url: string;
    thumbnail_url: string;
    filename: string;
    file_size: number;
    width: number;
    height: number;
}

export interface ProcessImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
}

/**
 * ✅ Image processing class
 */
export class ImageProcessor {
    /**
     * Process single image with options
     */
    static async processImage(
        inputPath: string,
        outputPath: string,
        options: ProcessImageOptions = {},
        mimetype?: string // tambahkan mimetype opsional
    ): Promise<void> {
        let format = options.format || 'jpeg';
        // Deteksi format dari mimetype jika ada
        if (mimetype) {
            if (mimetype === 'image/png') format = 'png';
            else if (mimetype === 'image/webp') format = 'webp';
            else format = 'jpeg';
        }
        const {
            width = 800,
            height = 600,
            quality = 85
        } = options;
        let sharpInstance = sharp(inputPath).resize(options.width ?? 800, options.height ?? 600, {
            fit: 'inside',
            withoutEnlargement: true
        });
        if (format === 'jpeg') sharpInstance = sharpInstance.jpeg({ quality: options.quality ?? 85, mozjpeg: true });
        if (format === 'png') sharpInstance = sharpInstance.png({ quality: options.quality ?? 85 });
        if (format === 'webp') sharpInstance = sharpInstance.webp({ quality: options.quality ?? 85 });
        await sharpInstance.toFile(outputPath);
        try {
            await sharp(inputPath)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality, mozjpeg: true })
                .toFile(outputPath);

            logger.debug('Image processed successfully', {
                inputPath: path.basename(inputPath),
                outputPath: path.basename(outputPath),
                width,
                height,
                quality,
                format
            });
        } catch (error: any) {
            logger.error('Error processing image', {
                inputPath: path.basename(inputPath),
                outputPath: path.basename(outputPath),
                error: error.message
            });
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }

    /**
     * Create image variants for single image (backward compatibility)
     */
    static async createImageVariants(
        originalPath: string,
        baseFileName: string,
        subdir: string,
        mimetype?: string
    ): Promise<ImageVariants> {
        if (!originalPath || !baseFileName) {
            throw new Error("Original path atau base file name tidak valid.");
        }

        let format: 'jpeg' | 'png' | 'webp' = 'jpeg';
        if (mimetype === 'image/png') format = 'png';
        else if (mimetype === 'image/webp') format = 'webp';

        const outputDir = DirectoryManager.getDirectoryPath(subdir);
        const variants = FileNameGenerator.generateVariantNames(baseFileName, format);

        const variantPaths = {
            thumbnail: path.join(outputDir, variants.thumbnail),
            medium: path.join(outputDir, variants.medium),
            original: path.join(outputDir, variants.original)
        };

        try {
            // Proses semua varian gambar
            await ImageProcessor.processImage(originalPath, variantPaths.thumbnail, {
                ...UPLOAD_CONFIG.IMAGE_PROCESSING.THUMBNAIL,
                quality: 70,
                format
            }, mimetype);

            await ImageProcessor.processImage(originalPath, variantPaths.medium, {
                ...UPLOAD_CONFIG.IMAGE_PROCESSING.MEDIUM,
                quality: 85,
                format
            }, mimetype);

            await ImageProcessor.processImage(originalPath, variantPaths.original, {
                ...UPLOAD_CONFIG.IMAGE_PROCESSING.ORIGINAL,
                quality: 90,
                format
            }, mimetype);

            // Hapus file asli setelah diproses
            await FileCleanup.deleteFile(originalPath);

            logger.info('Image variants created successfully', {
                originalFile: path.basename(originalPath),
                variants: Object.keys(variants)
            });

            return {
                thumbnail: PathUtils.getFileUrl(subdir, variants.thumbnail),
                medium: PathUtils.getFileUrl(subdir, variants.medium),
                original: PathUtils.getFileUrl(subdir, variants.original)
            };
        } catch (error: any) {
            // Hapus file yang sudah dibuat jika terjadi error
            await FileCleanup.deleteFiles(Object.values(variantPaths));
            logger.error('Error creating image variants', {
                originalFile: path.basename(originalPath),
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Process multiple images and return metadata
     */
    static async processMultipleImages(
        files: Express.Multer.File[],
        subdir: string
    ): Promise<ImageMetadata[]> {
        const results: ImageMetadata[] = [];

        try {
            for (const file of files) {
                const metadata = await this.processSingleFileWithMetadata(file, subdir);
                results.push(metadata);
            }

            logger.info('Multiple images processed successfully', {
                count: results.length,
                totalSize: results.reduce((sum, img) => sum + img.file_size, 0)
            });

            return results;
        } catch (error: any) {
            // Clean up processed files on error
            await FileCleanup.cleanupUploadedFiles(files);

            // Clean up any created variants
            for (const result of results) {
                await FileCleanup.deleteImageVariants(result.original_url).catch(() => { });
            }

            logger.error('Error processing multiple images', {
                error: error.message,
                filesCount: files.length
            });
            throw error;
        }
    }

    /**
     * Process single file and return metadata
     */
    private static async processSingleFileWithMetadata(
        file: Express.Multer.File,
        subdir: string
    ): Promise<ImageMetadata> {
        try {
            // Get original image dimensions and metadata
            const imageInfo = await sharp(file.path).metadata();

            const outputDir = DirectoryManager.getDirectoryPath(subdir);
            const variants = FileNameGenerator.generateVariantNames(file.filename);

            const variantPaths = {
                thumbnail: path.join(outputDir, variants.thumbnail),
                medium: path.join(outputDir, variants.medium),
                original: path.join(outputDir, variants.original)
            };

            // Create all variants
            await Promise.all([
                this.processImage(file.path, variantPaths.thumbnail, {
                    ...UPLOAD_CONFIG.IMAGE_PROCESSING.THUMBNAIL,
                    quality: 70
                }),
                this.processImage(file.path, variantPaths.medium, {
                    ...UPLOAD_CONFIG.IMAGE_PROCESSING.MEDIUM,
                    quality: 85
                }),
                this.processImage(file.path, variantPaths.original, {
                    ...UPLOAD_CONFIG.IMAGE_PROCESSING.ORIGINAL,
                    quality: 90
                })
            ]);

            // Delete original uploaded file
            await FileCleanup.deleteFile(file.path);

            return {
                original_url: PathUtils.getFileUrl(subdir, variants.original),
                medium_url: PathUtils.getFileUrl(subdir, variants.medium),
                thumbnail_url: PathUtils.getFileUrl(subdir, variants.thumbnail),
                filename: file.originalname,
                file_size: file.size,
                width: imageInfo.width || 0,
                height: imageInfo.height || 0
            };

        } catch (error: any) {
            // Clean up on error
            await FileCleanup.deleteFile(file.path).catch(() => { });

            logger.error('Error processing single file', {
                filename: file.originalname,
                error: error.message
            });
            throw new Error(`Failed to process image ${file.originalname}: ${error.message}`);
        }
    }
}