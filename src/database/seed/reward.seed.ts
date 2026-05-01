import { prisma } from "../../database/index.js";

export const seedRewards = async () => {
  const initialRewards = [
    {
      title: "Silver Voucher Rp10.000",
      description: "Berlaku untuk semua item di marketplace Amerta tanpa minimum belanja.",
      cost: 1000,
      type: "VOUCHERS",
      icon: "FaTicketAlt",
      color: "from-blue-600 via-cyan-400 to-indigo-500",
      tag: "POPULER",
      rarity: "Common",
      value: 10000
    },
    {
      title: "Gold Voucher Rp25.000",
      description: "Diskon belanja spesial untuk member setia Amerta dengan minimal belanja Rp50k.",
      cost: 2400,
      type: "VOUCHERS",
      icon: "FaGift",
      color: "from-amber-400 via-yellow-300 to-orange-500",
      tag: "PILIHAN TERBAIK",
      rarity: "Rare",
      value: 25000
    },
    {
      title: "Platinum Voucher Rp50.000",
      description: "Eksklusif Platinum. Diskon besar untuk mendukung gaya hidup berkelanjutanmu.",
      cost: 4500,
      type: "VOUCHERS",
      icon: "FaGem",
      color: "from-purple-600 via-pink-400 to-rose-500",
      tag: "EKSKLUSIF",
      rarity: "Epic",
      value: 50000
    },
    {
      title: "Plant a Tree Ticket",
      description: "Amerta akan menanam 1 bibit pohon atas namamu melalui partner konservasi kami.",
      cost: 500,
      type: "CHARITY",
      icon: "FaLeaf",
      color: "from-green-600 via-emerald-400 to-teal-500",
      tag: "PAHLAWAN BUMI",
      rarity: "Legendary",
      value: 0
    },
    {
      title: "Donasi Logistik",
      description: "Bantu biaya operasional pengiriman pakaian donasi ke desa terpencil di seluruh Indonesia.",
      cost: 1500,
      type: "CHARITY",
      icon: "FaHandHoldingHeart",
      color: "from-orange-600 via-amber-400 to-yellow-500",
      tag: "KOMUNITAS",
      rarity: "Rare",
      value: 0
    }
  ];

  console.log('Seeding rewards...');
  
  // Clean existing rewards before seeding to avoid duplicates during dev
  await prisma.reward.deleteMany({});

  for (const reward of initialRewards) {
    await prisma.reward.create({
      data: reward
    });
  }

  console.log('Rewards seeded!');
};
