import { prisma } from "../index.js";
import { PasswordUtils } from "../../utils/password.utils.js";
import { Role } from "../../generated/prisma/client.js";

export async function companySeed() {
    console.log("Seeding companies and company users...");

    const hashedPassword = await PasswordUtils.hashPassword("company123");

    // 1. Create a Company
    const company = await prisma.company.upsert({
        where: { id: "759ed1e0-2d7c-43b0-8178-0b3d003e230c" }, // Using a fixed UUID for consistent seeding
        update: {},
        create: {
            id: "759ed1e0-2d7c-43b0-8178-0b3d003e230c",
            name: "Amerta Corp",
            email: "info@amertacorp.com",
            address: "Jakarta Selatan, Indonesia",
            phone: "021-5555555",
            website: "https://amertacorp.com",
            description: "Leading technology solution provider.",
        },
    });

    // 2. Create a Company User linked to that company
    const companyUser = await prisma.user.upsert({
        where: { email: "owner@amertacorp.com" },
        update: {
            companyId: company.id
        },
        create: {
            email: "owner@amertacorp.com",
            name: "Company Owner",
            password: hashedPassword,
            role: Role.COMPANY,
            is_verified: true,
            companyId: company.id
        },
    });

    console.log("✅ Companies and Company Users seeded.");
}
