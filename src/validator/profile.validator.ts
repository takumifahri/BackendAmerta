import z from "zod";
import type { Request, Response, NextFunction } from "express";
import HttpException from "../utils/HttpExecption.utils.js";

// Validator untuk update profile
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Nama minimal 2 karakter")
        .max(100, "Nama maksimal 100 karakter")
        .optional(),
    phone: z
        .string()
        .regex(/^(\+62|62|0)[0-9]{9,13}$/, "Format nomor telepon tidak valid")
        .nullable()
        .optional(),
    address: z
        .string()
        .min(10, "Alamat minimal 10 karakter")
        .max(500, "Alamat maksimal 500 karakter")
        .nullable()
        .optional()
});

// Validator untuk file upload profile photo
export const profilePhotoSchema = z.object({
    fieldname: z.literal("profile_photo"),
    mimetype: z.enum(["image/jpeg", "image/png", "image/webp"]).or(
        z.string().refine(() => false, { message: "Format file harus JPEG, PNG, atau WebP" })
    ),
    size: z
        .number()
        .max(5 * 1024 * 1024, "Ukuran file maksimal 5MB")
});

// Middleware validator untuk update profile
export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = updateProfileSchema.safeParse(req.body);
        
        if (!result.success) {
            const errors = result.error.issues.map(err => ({
                field: err.path.join("."),
                message: err.message
            }));
            throw new HttpException(400, JSON.stringify(errors));
        }

        req.body = result.data;
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware validator untuk profile photo
export const validateProfilePhoto = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.file) {
            const result = profilePhotoSchema.safeParse(req.file);
            
            if (!result.success) {
                const errors = result.error.issues.map(err => ({
                    field: err.path.join("."),
                    message: err.message
                }));
                throw new HttpException(400, JSON.stringify(errors));
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Type exports
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfilePhotoInput = z.infer<typeof profilePhotoSchema>;