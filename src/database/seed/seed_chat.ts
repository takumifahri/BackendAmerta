import { prisma } from '../index.js';

export async function chatSeed() {
  console.log("Seeding chat rooms...");

  // Get dynamic IDs
  const admin = await prisma.user.findUnique({ where: { email: "admin@amerta.com" } });
  const fahri = await prisma.user.findUnique({ where: { email: "fahri.radiansyah@gmail.com" } });

  if (!admin || !fahri) {
    throw new Error("Required users for chat seed not found. Run userSeed first.");
  }

  // Create Room
  const room = await prisma.chatRoom.create({
    data: {
      type: 'USER',
      users: {
        create: [
          { userId: admin.id },
          { userId: fahri.id }
        ]
      }
    }
  });

  // Create First Message
  await prisma.message.create({
    data: {
      roomId: room.id,
      userId: admin.id,
      content: "Halo Fahri! Selamat datang di Amerta. Ada yang bisa kami bantu hari ini?",
      type: 'TEXT'
    }
  });

  // Update room last message
  await prisma.chatRoom.update({
    where: { id: room.id },
    data: {
      lastMessage: "Halo Fahri! Selamat datang di Amerta. Ada yang bisa kami bantu hari ini?",
      lastMessageAt: new Date()
    }
  });

  console.log(`✅ Chat room and message seeded.`);
}
