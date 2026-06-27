const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findFirst();
  const pkg = await prisma.package.findFirst();
  
  if (!user || !pkg) {
    console.log('No user or package found');
    return;
  }
  
  console.log('User:', user.id, user.email);
  console.log('Package:', pkg.id, pkg.name);
  
  try {
    const { orderService } = require('./lib/services/order-service');
    // We can't directly require TS files easily in node without ts-node, but let's just check the DB first.
    
    // Check ManualPaymentSetting
    const qris = await prisma.manualPaymentSetting.findFirst();
    console.log('QRIS Setting:', qris);
  } catch(e) {
    console.error(e);
  }
}

main().finally(() => { prisma.$disconnect(); pool.end(); });
