import { prisma } from "../index.js";
import { userSeed } from "./user.seed.js";
import { companySeed } from "./company.seed.js";
import { chatSeed } from "./seed_chat.js";
import { marketplaceSeed } from "./seed-marketplace.js";

async function main() {
    console.log("🌱 Starting seeding...");
    
    try {
        await userSeed();
        await companySeed();
        await chatSeed();
        await marketplaceSeed();
        
        console.log("✅ Seeding completed successfully.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
