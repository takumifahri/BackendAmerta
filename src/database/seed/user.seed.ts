import { prisma } from "../index.js";
import { PasswordUtils } from "../../utils/password.utils.js";
import { Role } from "../../generated/prisma/client.js";

export async function userSeed() {
    console.log("Seeding users...");

    const hashedPassword = await PasswordUtils.hashPassword("password123");

    // Clear existing users
    // await prisma.user.deleteMany();

    const admin = await prisma.user.upsert({
        where: { email: "admin@amerta.com" },
        update: {},
        create: {
            email: "admin@amerta.com",
            name: "Admin Amerta",
            password: hashedPassword,
            role: Role.ADMIN,
            is_verified: true,
        },
    });

    const user = await prisma.user.upsert({
        where: { email: "user@amerta.com" },
        update: {},
        create: {
            email: "user@amerta.com",
            name: "Regular User",
            password: hashedPassword,
            role: Role.USER,
            is_verified: true,
        },
    });

    console.log("✅ Users seeded.");
}
