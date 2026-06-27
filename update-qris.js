const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.manualPaymentSetting.update({
    where: { provider: 'MANUAL_QRIS' },
    data: {
      qrisImageUrl: 'https://placehold.co/400x400.png?text=QR+Code+Dummy',
    }
  });
  console.log('qrisImageUrl updated.');
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    pool.end();
  });
