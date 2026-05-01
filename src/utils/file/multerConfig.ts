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
    donationImages: MulterConfigFactory.createImageUploader('DONATION_IMAGES'),
    communityPost: MulterConfigFactory.createImageUploader('COMMUNITY_POST'),
    transaction: MulterConfigFactory.createImageUploader('TRANSACTION'),
    profile: MulterConfigFactory.createImageUploader('PROFILE'),
    marketplaceItem: MulterConfigFactory.createImageUploader('MARKETPLACE_ITEM'),
    paymentProof: MulterConfigFactory.createImageUploader('PAYMENT_PROOF'),

    // Document uploaders (if needed)
    documents: {
        donationImages: MulterConfigFactory.createDocumentUploader('DONATION_IMAGES'),
        communityPost: MulterConfigFactory.createDocumentUploader('COMMUNITY_POST'),
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
            case 'DONATION_IMAGES':
                return uploadConfigs.donationImages.single(fieldName);
            case 'COMMUNITY_POST':
                return uploadConfigs.communityPost.single(fieldName);
            case 'TRANSACTION':
                return uploadConfigs.transaction.single(fieldName);
            case 'PROFILE':
                return uploadConfigs.profile.single(fieldName);
            case 'MARKETPLACE_ITEM':
                return uploadConfigs.marketplaceItem.single(fieldName);
            case 'PAYMENT_PROOF':
                return uploadConfigs.paymentProof.single(fieldName);
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
            case 'DONATION_IMAGES':
                return uploadConfigs.donationImages.array(fieldName, maxFiles);
            case 'COMMUNITY_POST':
                return uploadConfigs.communityPost.array(fieldName, maxFiles);
            case 'TRANSACTION':
                return uploadConfigs.transaction.array(fieldName, maxFiles);
            case 'PROFILE':
                return uploadConfigs.profile.array(fieldName, maxFiles);
            case 'MARKETPLACE_ITEM':
                return uploadConfigs.marketplaceItem.array(fieldName, maxFiles);
            case 'PAYMENT_PROOF':
                return uploadConfigs.paymentProof.array(fieldName, maxFiles);
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
            case 'DONATION_IMAGES':
                return uploadConfigs.donationImages.fields(fields);
            case 'COMMUNITY_POST':
                return uploadConfigs.communityPost.fields(fields);
            case 'TRANSACTION':
                return uploadConfigs.transaction.fields(fields);
            case 'PROFILE':
                return uploadConfigs.profile.fields(fields);
            case 'MARKETPLACE_ITEM':
                return uploadConfigs.marketplaceItem.fields(fields);
            case 'PAYMENT_PROOF':
                return uploadConfigs.paymentProof.fields(fields);
            default:
                throw new Error(`Unsupported category: ${category}`);
        }
    }
}