interface AppConfig {
    port: number;
    env: string;
    frontendUrl: string;
    jwt: {
        secret: string;
        expiration: string;
        resetTokenExpiryMinutes: number;
    };
    db: {
        databaseUrl: string;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
}

const config: AppConfig = {
    // SERVER CONFIG
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // JWT CONFIG
    jwt: {
        secret: process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION',
        expiration: process.env.JWT_EXPIRATION_TIME || '1d',
        resetTokenExpiryMinutes: parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || '15', 10)
    },

    // DATABASE CONFIG (Prisma uses this single URL)
    db: {
        databaseUrl: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/konveksi_db_default',
    },

    smtp: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.MAIL_FROM || 'System <no-reply@localhost.com>',
    }
};

export const UPLOAD_CONFIG = {
    // Base upload directory
    BASE_DIR: 'src/uploads',
    
    // Subdirectories for different file types
    SUBDIRS: {
        CHAT_IMAGE: 'chat-images',
        EXCHANGE_ITEM: 'exchange-items',
        TRANSACTION: 'transactions',
        PROFILE: 'profiles',
        DONATION_IMAGES: 'donation-images',
        COMMUNITY_POST: 'community-post'
    },
    
    // File size limits (in bytes)
    MAX_FILE_SIZE: {
        IMAGE: 5 * 1024 * 1024,  // 5MB
        DOCUMENT: 10 * 1024 * 1024 // 10MB
    },
    
    // Allowed file types
    ALLOWED_TYPES: {
        IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        DOCUMENTS: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    },
    
    // Image processing settings
    IMAGE_PROCESSING: {
        THUMBNAIL: { width: 300, height: 300 },
        MEDIUM: { width: 800, height: 600 },
        ORIGINAL: { width: 1920, height: 1080 }
    },

    // Upload limits
    MAX_FILES: {
        DONATION_IMAGES: 10,
        COMMUNITY_POST: 5,
        TRANSACTION: 3,
        PROFILE: 1,
        CHAT_IMAGE: 1,
        EXCHANGE_ITEM: 5
    }
} as const;

export type UploadSubdir = keyof typeof UPLOAD_CONFIG.SUBDIRS;
export type FileCategory = keyof typeof UPLOAD_CONFIG.MAX_FILES;
export default config;