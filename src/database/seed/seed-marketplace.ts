import { prisma } from '../index.js';

export const marketplaceSeed = async () => {
  console.log('Seeding marketplace items...');

  const items = [
    {
      name: 'Amerta Upcycled Denim Jacket',
      description: 'Jaket denim vintage yang telah dimodifikasi dengan tambalan kain perca tradisional. Stylish dan ramah lingkungan.',
      price: 250000,
      stock: 5,
      category: 'Outerwear',
      points: 100,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1576905341935-4262c55979bb?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    },
    {
      name: 'Recycled Canvas Totebag',
      description: 'Totebag kuat dari bahan kanvas sisa industri konveksi. Dilengkapi dengan kantong organizer di dalam.',
      price: 75000,
      stock: 20,
      category: 'Accessories',
      points: 30,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    },
    {
      name: 'Modern Batik Patchwork Shirt',
      description: 'Kemeja unik yang menggabungkan berbagai motif batik sisa potongan kain premium. Nyaman untuk acara formal maupun santai.',
      price: 185000,
      stock: 8,
      category: 'Tops',
      points: 75,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    }
  ];

  for (const item of items) {
    const createdItem = await prisma.marketplaceItem.create({
      data: item
    });
    console.log(`Created item: ${createdItem.name}`);
  }
};

