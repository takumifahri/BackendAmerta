import multer from 'multer';
import { DirectoryManager, FileNameGenerator, FileValidator } from './fileUtils.js';
import { UPLOAD_CONFIG, type FileCategory } from '../../config/config.js';

class CustomError extends Error {
    public originalError: any;

    constructor(message: string, originalError: any) {
        super(message);
        this.originalError = originalError;
    }
}
/**
 * ✅ Multer storage factory
 */
class MulterStorageFactory {
    static create(subdir: string) {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                try {
                    const uploadPath = DirectoryManager.getDirectoryPath(subdir);
                    DirectoryManager.ensureUploadDirs(); // Pastikan direktori dibuat
                    cb(null, uploadPath);
                } catch (error: any) {
                    cb(new CustomError(`Failed to resolve upload path: ${error.message}`, error), "");
                }
            },
            filename: (req, file, cb) => {
                const uniqueName = FileNameGenerator.generateUniqueFileName(file.originalname);
                cb(null, uniqueName);
            }
        });
    }
}

/**
 * ✅ File filter factory
 */
class FileFilterFactory {
    static createImageFilter() {
        return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
            if (FileValidator.validateImageFile(file)) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type. Allowed types: ${UPLOAD_CONFIG.ALLOWED_TYPES.IMAGES.join(', ')}`));
            }
        };
    }

    static createDocumentFilter() {
        return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
            if (FileValidator.validateDocumentFile(file)) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type. Allowed types: ${UPLOAD_CONFIG.ALLOWED_TYPES.DOCUMENTS.join(', ')}`));
            }
        };
    }
}

/**
 * ✅ Multer configuration factory
 */
class MulterConfigFactory {
    static createImageUploader(category: FileCategory) {
        const subdir = UPLOAD_CONFIG.SUBDIRS[category];
        const maxFiles = UPLOAD_CONFIG.MAX_FILES[category];

        return multer({
            storage: MulterStorageFactory.create(subdir), // ✅ Tambahkan storage agar file disimpan
            limits: {
                fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE.IMAGE,
                files: maxFiles
            },
            fileFilter: FileFilterFactory.createImageFilter()
        });
    }

    static createDocumentUploader(category: FileCategory) {
        const subdir = UPLOAD_CONFIG.SUBDIRS[category];
        const maxFiles = UPLOAD_CONFIG.MAX_FILES[category];

        return multer({
            storage: MulterStorageFactory.create(subdir),
            limits: {
                fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE.DOCUMENT,
                files: maxFiles
            },
            fileFilter: FileFilterFactory.createDocumentFilter()
        });
    }
}

/**
 * ✅ Pre-configured upload handlers
 */
export const uploadConfigs = {
    // Image uploaders
    modelBaju: MulterConfigFactory.createImageUploader('MODEL_BAJU'),
    customOrder: MulterConfigFactory.createImageUploader('CUSTOM_ORDER'),
    transaction: MulterConfigFactory.createImageUploader('TRANSACTION'),
    profile: MulterConfigFactory.createImageUploader('PROFILE'),

    // Document uploaders (if needed)
    documents: {
        modelBaju: MulterConfigFactory.createDocumentUploader('MODEL_BAJU'),
        customOrder: MulterConfigFactory.createDocumentUploader('CUSTOM_ORDER'),
        transaction: MulterConfigFactory.createDocumentUploader('TRANSACTION')
    }
} as const;

/**
 * ✅ Upload middleware helpers - Fix property access
 */
export class UploadMiddleware {
    /**
     * Single image upload
     */
    static single(category: FileCategory, fieldName: string = 'image') {
        // ✅ Fix: use proper property names
        switch (category) {
            case 'MODEL_BAJU':
                return uploadConfigs.modelBaju.single(fieldName);
            case 'CUSTOM_ORDER':
                return uploadConfigs.customOrder.single(fieldName);
            case 'TRANSACTION':
                return uploadConfigs.transaction.single(fieldName);
            case 'PROFILE':
                return uploadConfigs.profile.single(fieldName);
            default:
                throw new Error(`Unsupported category: ${category}`);
        }
    }

    /**
     * Multiple images upload
     */
    static multiple(category: FileCategory, fieldName: string = 'images', maxCount?: number) {
        const maxFiles = maxCount || UPLOAD_CONFIG.MAX_FILES[category];

        // ✅ Fix: use proper property names
        switch (category) {
            case 'MODEL_BAJU':
                return uploadConfigs.modelBaju.array(fieldName, maxFiles);
            case 'CUSTOM_ORDER':
                return uploadConfigs.customOrder.array(fieldName, maxFiles);
            case 'TRANSACTION':
                return uploadConfigs.transaction.array(fieldName, maxFiles);
            case 'PROFILE':
                return uploadConfigs.profile.array(fieldName, maxFiles);
            default:
                throw new Error(`Unsupported category: ${category}`);
        }
    }

    /**
     * Mixed fields upload (different field names)
     */
    static fields(category: FileCategory, fields: { name: string; maxCount?: number }[]) {
        // ✅ Fix: use proper property names
        switch (category) {
            case 'MODEL_BAJU':
                return uploadConfigs.modelBaju.fields(fields);
            case 'CUSTOM_ORDER':
                return uploadConfigs.customOrder.fields(fields);
            case 'TRANSACTION':
                return uploadConfigs.transaction.fields(fields);
            case 'PROFILE':
                return uploadConfigs.profile.fields(fields);
            default:
                throw new Error(`Unsupported category: ${category}`);
        }
    }
}