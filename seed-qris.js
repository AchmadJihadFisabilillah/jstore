const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.manualPaymentSetting.upsert({
    where: { provider: 'MANUAL_QRIS' },
    update: {},
    create: {
      provider: 'MANUAL_QRIS',
      merchantName: 'JStore Default',
      instructions: 'Silakan transfer ke rekening QRIS berikut',
      isActive: true,
    }
  });
  console.log('ManualPaymentSetting configured.');
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    pool.end();
  });
