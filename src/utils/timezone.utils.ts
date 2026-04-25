/**
 * Convert UTC Date to WIB (Asia/Jakarta, +07)
 */
export function toWIB(date: Date | null): Date | null {
    if (!date) return null;
    // Tambah 7 jam (25200000 ms) untuk offset WIB
    const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return wibTime;
}

/**
 * Convert WIB Date back to UTC (jika perlu)
 */
export function toUTC(date: Date | null): Date | null {
    if (!date) return null;
    const utcTime = new Date(date.getTime() - 7 * 60 * 60 * 1000);
    return utcTime;
}