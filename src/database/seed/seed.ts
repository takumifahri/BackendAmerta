import { prisma } from "../index.js";
import { userSeed } from "./user.seed.js";
import { companySeed } from "./company.seed.js";

async function main() {
    console.log("🌱 Starting seeding...");
    
    try {
        await userSeed();
        await companySeed();
        
        console.log("✅ Seeding completed successfully.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
