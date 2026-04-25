import z from "zod";

// ✅ NEW: Detail item schema
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
    jumlah: z.number().int().positive("jumlah must be positive"),
    warna_custom: z.string().optional().nullable()
});

// ✅ UPDATED: Add POS/source fields
const createSchema = z.object({
    nama_pemesanan: z.string().min(1, "nama_pemesanan is required"),
    user_id: z.number().int().positive(),
    status: z.enum([
        "pending",
        "ditolak",
        "negosiasi",
        "pembayaran",
        "pengerjaan",
        "dibatalkan",
        "selesai"
    ]).optional(),
    catatan: z.string().optional().nullable(),
    material_sendiri: z.boolean().optional(),
    material_id: z.number().int().optional().nullable(),
    model_baju_id: z.number().int().optional().nullable(),
    referensi_custom: z.boolean().optional(),
    rincian_item: z.array(detailItemSchema).min(1, "At least one rincian_item is required"),
    
    // ✅ ADDED: Source enum untuk POS tracking
    source: z.enum(["client", "pos", "whatsapp", "offline"])
        .optional()
        .default("client")
        .describe("Sumber pemesanan (client/pos/whatsapp/offline)"),
    
    // ✅ ADDED: POS fields - opsional tapi untuk POS harus diisi
    nama_customer: z.string()
        .min(3, "nama_customer minimal 3 karakter")
        .optional()
        .nullable()
        .describe("Nama customer (wajib jika source=pos)"),
    
    nomor_telpon: z.string()
        .regex(/^\+?[0-9\s\-()]{7,}$/, "nomor_telpon format tidak valid")
        .optional()
        .nullable()
        .describe("Nomor telepon customer (wajib jika source=pos)"),
})
// ✅ ADDED: Refine untuk business logic validasi POS
.refine(
    (data) => {
        // Jika source=pos, nama_customer dan nomor_telpon wajib
        if (data.source === "pos") {
            return (
                data.nama_customer && 
                data.nama_customer.trim().length > 0 &&
                data.nomor_telpon && 
                data.nomor_telpon.trim().length > 0
            );
        }
        return true;
    },
    {
        message: "Untuk source=pos, nama_customer dan nomor_telpon wajib diisi",
        path: ["source"] // Identifikasi error di field ini
    }
);

const updateSchema = z.object({
    nama_pemesanan: z.string().min(1).optional(),
    catatan: z.string().optional().nullable(),
    material_sendiri: z.boolean().optional(),
    material_id: z.number().int().optional().nullable(),
    model_baju_id: z.number().int().optional().nullable(),
    rincian_item: z.array(detailItemSchema).optional(),
    remove_referensi_ids: z.array(z.number().int()).optional(),
    
    // ✅ ADDED: Allow update untuk source fields
    source: z.enum(["client", "pos", "whatsapp", "offline"]).optional(),
    nama_customer: z.string().min(3).optional().nullable(),
    nomor_telpon: z.string().regex(/^\+?[0-9\s\-()]{7,}$/).optional().nullable(),
});

const terimaSchema = z.object({
    admin_id: z.number().int().positive("admin_id must be a positive integer")
});

const tolakSchema = z.object({
    admin_id: z.number().int().positive("admin_id must be a positive integer"),
    alasan_ditolak: z.string().min(1, "alasan_ditolak is required")
});

const selesaikanSchema = z.object({
    admin_id: z.number().int().positive("admin_id must be a positive integer")
});

const dealNegosiasiSchema = z.object({
    admin_id: z.number().int().positive("admin_id must be a positive integer"),
    total_harga: z.union([
        z.string().transform((val) => BigInt(val)),
        z.number().transform((val) => BigInt(val)),
        z.bigint()
    ]).refine((val) => val > 0n, { message: "total_harga must be positive" })
});

const batalPemesananSchema = z.object({
    admin_id: z.number().int().positive("admin_id must be a positive integer"),
    alasan_ditolak: z.string().optional().nullable()
});

const validatorCustomOrder = {
    createSchema,
    updateSchema,
    terimaSchema,
    tolakSchema,
    dealNegosiasiSchema,
    batalPemesananSchema,
    selesaikanSchema,
    detailItemSchema
};

export default validatorCustomOrder;