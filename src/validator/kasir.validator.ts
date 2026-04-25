import z from "zod";
import type { Request, Response, NextFunction } from "express";

const detailItemSchema = z.object({
    ukuran: z.enum([
        "extra_small",
        "small",
        "medium",
        "reguler",
        "large",
        "extra_large",
        "double_extra_large",
        "custom"
    ]),
    jumlah: z.number().int().positive("Jumlah harus positif"),
    warna_custom: z.string().optional().nullable()
});

export const createPOSCustomOrderSchema = z.object({
    nama_pemesanan: z.string().min(1, "Nama pemesanan diperlukan"),
    user_id: z.number().int().positive("User ID harus valid"),
    rincian_item: z.array(detailItemSchema).min(1, "Minimal 1 rincian item"),
    status: z.string().optional(),
    catatan: z.string().optional().nullable(),
    material_sendiri: z.boolean().optional(),
    material_id: z.number().int().optional().nullable(),
    model_baju_id: z.number().int().optional().nullable(),
    referensi_custom: z.boolean().optional(),
    nama_customer: z.string().min(1),
    nomor_telpon: z.string().min(1),
    email_customer: z.string().email().optional().nullable(),
    source: z.enum(["pos", "client", "whatsapp", "offline"]).optional()
});

export const dealNegosiasiSchema = z.object({
    total_harga: z.string().regex(/^\d+$/, "Total harga harus berupa angka"),
    keterangan: z.string().optional().nullable()
});

export const pembatalanSchema = z.object({
    keterangan: z.string().optional().nullable()
});

export const pembayaranSchema = z.object({
    payment: z.enum(["GOPAY", "OVO", "SEABANK", "BCA", "SHOPEEPAY"]),
    total_harga: z.string().regex(/^\d+$/, "Total harga harus berupa angka"),  // ✅ TAMBAH
    keterangan: z.string().optional().nullable()
});

export const validateCreatePOSCustomOrder = (req: Request, res: Response, next: NextFunction) => {
    const result = createPOSCustomOrderSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues.map(e => ({ field: e.path.join("."), message: e.message }))
        });
    }
    req.body = result.data;
    next();
};

export const validateDealNegosiasi = (req: Request, res: Response, next: NextFunction) => {
    const result = dealNegosiasiSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues.map(e => ({ field: e.path.join("."), message: e.message }))
        });
    }
    req.body = result.data;
    next();
};

export const validatePembatalan = (req: Request, res: Response, next: NextFunction) => {
    const result = pembatalanSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues.map(e => ({ field: e.path.join("."), message: e.message }))
        });
    }
    req.body = result.data;
    next();
};

export const validatePembayaran = (req: Request, res: Response, next: NextFunction) => {
    const result = pembayaranSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues.map(e => ({ field: e.path.join("."), message: e.message }))
        });
    }
    req.body = result.data;
    next();
};