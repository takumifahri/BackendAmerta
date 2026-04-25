import { DirectoryManager } from './file/fileUtils.js';
import logger from './logger.utils.js';

// Re-export all modules for easy access
export { UPLOAD_CONFIG } from '../config/config.js';
export type { UploadSubdir, FileCategory } from '../config/config.js';

export {
    DirectoryManager,
    FileNameGenerator,
    PathUtils,
    FileValidator,
    FileCleanup
} from './file/fileUtils.js';

export {
    ImageProcessor
} from './file/imageProcessing.js'; // ✅ Fix: Use imageProcessing.js (your existing file)
export type { ImageVariants, ImageMetadata, ProcessImageOptions } from './file/imageProcessing.js';

export {
    uploadConfigs,
    UploadMiddleware
} from './file/multerConfig.js';

// ✅ Import for re-export
import { UPLOAD_CONFIG } from '../config/config.js';
import { 
    FileNameGenerator,
    PathUtils,
    FileValidator,
    FileCleanup 
} from './file/fileUtils.js';
import { ImageProcessor } from './file/imageProcessing.js';
import { uploadConfigs, UploadMiddleware } from './file/multerConfig.js';

/**
 * ✅ Initialize file handler system
 */
export const initializeFileHandler = (): void => {
    DirectoryManager.ensureUploadDirs();
    logger.info('File handler system initialized successfully');
};

/**
 * ✅ Convenience exports for backward compatibility
 */
export const generateUniqueFileName = FileNameGenerator.generateUniqueFileName;
export const getDirectoryPath = DirectoryManager.getDirectoryPath;

export const getFilePath = PathUtils.getFilePath;
export const getFileUrl = PathUtils.getFileUrl;
export const urlToFilePath = PathUtils.urlToFilePath;

export const validateFileType = FileValidator.validateFileType;
export const validateImageFile = FileValidator.validateImageFile;
export const validateDocumentFile = FileValidator.validateDocumentFile;

export const deleteFile = FileCleanup.deleteFile;
export const deleteFileByUrl = FileCleanup.deleteFileByUrl;
export const deleteFiles = FileCleanup.deleteFiles;
export const deleteImageVariants = FileCleanup.deleteImageVariants;
export const cleanupUploadedFiles = FileCleanup.cleanupUploadedFiles;

export const processImage = ImageProcessor.processImage;
export const createImageVariants = ImageProcessor.createImageVariants;
export const processMultipleImages = ImageProcessor.processMultipleImages;

/**
 * ✅ Default export with all utilities
 */
export default {
    // Configuration
    UPLOAD_CONFIG,
    
    // Utilities
    DirectoryManager,
    FileNameGenerator,
    PathUtils,
    FileValidator,
    FileCleanup,
    ImageProcessor,
    
    // Multer configs
    uploadConfigs,
    UploadMiddleware,
    
    // Initialization
    initializeFileHandler
};