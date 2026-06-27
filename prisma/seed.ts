import { PrismaClient } from "@prisma/client";
import { Role } from "@/lib/constants/roles";
import { hashSync } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PERMISSIONS } from "../lib/auth/rbac";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categoriesSeed = [
  { name: "Streaming", slug: "streaming", description: "Layanan streaming film & TV premium", icon: "Tv", color: "violet", order: 1 },
  { name: "Musik", slug: "music", description: "Layanan streaming musik premium", icon: "Headphones", color: "pink", order: 2 },
  { name: "Editing dan Desain", slug: "editing", description: "Tools editing video & desain grafis", icon: "Video", color: "blue", order: 3 },
  { name: "AI Tools", slug: "ai", description: "Asisten kecerdasan buatan premium", icon: "Sparkles", color: "amber", order: 4 },
  { name: "Produktivitas", slug: "productivity", description: "Layanan produktivitas & perkantoran", icon: "Laptop", color: "emerald", order: 5 },
  { name: "Lainnya", slug: "other", description: "Kategori produk digital lainnya", icon: "LayoutGrid", color: "gray", order: 6 },
];

const productsSeed = [
  {
    name: "Netflix",
    description: "Akun Netflix premium legal sharing dengan proses cepat.",
    category: "Streaming",
    packages: [
      { name: "1P1U - 1 minggu", duration: 7, price: 10000, costPrice: 4000, sku: "NETFLIX-1W-SH" },
      { name: "1P1U - 1 bulan", duration: 30, price: 18000, costPrice: 8000, sku: "NETFLIX-1M-SH" },
      { name: "1P1U - 2 bulan", duration: 60, price: 35000, costPrice: 15000, sku: "NETFLIX-2M-SH" },
      { name: "1P1U - 3 bulan", duration: 90, price: 52000, costPrice: 22000, sku: "NETFLIX-3M-SH" },
      { name: "Semi Private - 1 bulan", duration: 30, price: 23000, costPrice: 11000, sku: "NETFLIX-1M-SP" },
      { name: "Semi Private - 2 bulan", duration: 60, price: 44000, costPrice: 20000, sku: "NETFLIX-2M-SP" },
      { name: "Semi Private - 3 bulan", duration: 90, price: 66000, costPrice: 30000, sku: "NETFLIX-3M-SP" },
    ],
  },
  {
    name: "Canva Pro",
    description: "Upgrade Canva Pro untuk desain tanpa batas.",
    category: "Editing dan Desain",
    packages: [
      { name: "1 bulan", duration: 30, price: 1000, costPrice: 200, sku: "CANVA-1M" },
      { name: "2 bulan", duration: 60, price: 1500, costPrice: 400, sku: "CANVA-2M" },
      { name: "3 bulan", duration: 90, price: 2000, costPrice: 600, sku: "CANVA-3M" },
      { name: "6 bulan", duration: 180, price: 3000, costPrice: 1000, sku: "CANVA-6M" },
      { name: "1 tahun", duration: 365, price: 4000, costPrice: 1500, sku: "CANVA-1Y" },
    ],
  },
  {
    name: "ChatGPT+",
    description: "Akses ChatGPT Plus untuk produktivitas dan riset.",
    category: "AI Tools",
    packages: [
      { name: "Email pribadi", duration: 30, price: 12000, costPrice: 5000, sku: "GPT-1M-PRIV" },
      { name: "Email seller", duration: 30, price: 12000, costPrice: 5000, sku: "GPT-1M-SELL" },
    ],
  },
  {
    name: "Loklok",
    description: "Akun Loklok premium untuk hiburan full HD.",
    category: "Streaming",
    packages: [
      { name: "Basic", duration: 30, price: 10000, costPrice: 3000, sku: "LOKLOK-BASIC" },
      { name: "Standard", duration: 30, price: 15000, costPrice: 5000, sku: "LOKLOK-STANDARD" },
    ],
  },
  {
    name: "Disney+",
    description: "Akses Disney+ premium dengan harga hemat.",
    category: "Streaming",
    packages: [
      { name: "1 bulan", duration: 30, price: 10000, costPrice: 4000, sku: "DISNEY-1M" },
      { name: "2 bulan", duration: 60, price: 20000, costPrice: 8000, sku: "DISNEY-2M" },
      { name: "3 bulan", duration: 90, price: 30000, costPrice: 12000, sku: "DISNEY-3M" },
    ],
  },
  {
    name: "Grok AI",
    description: "Akses Grok AI untuk kebutuhan AI harian.",
    category: "AI Tools",
    packages: [
      { name: "7 hari", duration: 7, price: 10000, costPrice: 3000, sku: "GROK-7D" },
      { name: "1 bulan", duration: 30, price: 20000, costPrice: 7000, sku: "GROK-1M" },
    ],
  },
  {
    name: "CapCut Pro",
    description: "CapCut Pro premium untuk editing video cepat.",
    category: "Editing dan Desain",
    packages: [{ name: "1 bulan", duration: 30, price: 5000, costPrice: 1500, sku: "CAPCUT-1M" }],
  },
  {
    name: "Spotify",
    description: "Spotify premium untuk musik tanpa iklan.",
    category: "Musik",
    packages: [{ name: "1 bulan", duration: 30, price: 15000, costPrice: 5000, sku: "SPOTIFY-1M" }],
  },
];

async function main() {
  // Clean up order records and related tables
  await prisma.adminNotification.deleteMany();
  await prisma.adminActivityLog.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.voucherUsage.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.digitalStock.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.order.deleteMany();
  await prisma.package.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@jstore.id";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminJStore123!";
  
  await prisma.user.create({
    data: {
      name: "Admin JStore",
      email: adminEmail,
      password: hashSync(adminPassword, 10),
      role: Role.ADMIN,
      permissions: Object.values(PERMISSIONS),
    },
  });

  // 2. Seed Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesSeed) {
    const created = await prisma.category.create({
      data: cat
    });
    categoryMap[created.name] = created.id;
  }

  // 3. Seed Products with variants
  for (const product of productsSeed) {
    const categoryId = categoryMap[product.category] || null;
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        category: product.category,
        categoryId: categoryId,
        isActive: true,
        packages: {
          create: product.packages,
        },
      },
    });
  }

  // 4. Seed Settings
  const defaultSettings = [
    { key: "site_name", value: "JStore" },
    { key: "whatsapp_number", value: "6281234567890" },
    { key: "support_email", value: "support@jstore.id" },
    { key: "payment_fee", value: "1000" },
    { key: "maintenance_mode", value: "false" },
    { key: "currency", value: "IDR" },
    { key: "invoice_prefix", value: "INV" },
  ];

  for (const set of defaultSettings) {
    await prisma.setting.create({
      data: set
    });
  }

  // 5. Seed Manual Payment Settings
  await prisma.manualPaymentSetting.upsert({
    where: { provider: 'MANUAL_QRIS' },
    update: {},
    create: {
      provider: 'MANUAL_QRIS',
      merchantName: 'JStore Default',
      instructions: 'Silakan transfer ke rekening QRIS berikut',
      isActive: true,
      qrisImageUrl: '/qris.jpg',
    }
  });

  console.log("Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
