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
    console.log('No user or package');
    return;
  }
  
  console.log(`Testing checkout for User: ${user.id} and Package: ${pkg.id}`);
  
  try {
    // 1. Create Pending Order
    const order = await prisma.order.create({
      data: { userId: user.id, packageId: pkg.id, status: "PENDING" },
      include: { package: { include: { product: true } }, user: true },
    });
    console.log("Order created:", order.id);

    // 2. Generate invoiceNo
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNo = `INV-${order.package.sku || "JSTORE"}-${timestamp}-${Math.floor(100 + Math.random() * 900)}`;
    
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { invoiceNo },
      include: { package: { include: { product: true } }, user: true },
    });
    console.log("Invoice generated:", updatedOrder.invoiceNo);

    // 3. Create Manual Payment
    const settings = await prisma.manualPaymentSetting.findFirst({
      where: { provider: "MANUAL_QRIS" }
    });
    if (!settings) throw new Error("Manual QRIS settings not configured.");

    const amount = updatedOrder.package.price;
    const provider = "MANUAL_QRIS";
    const method = "QRIS";
    const idempotencyKey = `idemp-manual-${updatedOrder.id}-${amount}`;
    const expiredAt = new Date(Date.now() + settings.expiryMinutes * 60 * 1000);

    const payment = await prisma.payment.create({
      data: {
        orderId: updatedOrder.id,
        provider,
        method,
        idempotencyKey,
        amount,
        status: "WAITING_PAYMENT",
        qrImageUrl: settings.qrisImageUrl,
        expiredAt,
      },
    });

    console.log("Payment created:", payment.id);
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  }
}

main().finally(() => { prisma.$disconnect(); pool.end(); });
