import { OrderStatus } from "@prisma/client";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma/client";

export const orderRepository = {
  createPending(userId: string, packageId: string) {
    return prisma.order.create({
      data: { userId, packageId, status: OrderStatus.PENDING },
      include: { package: { include: { product: true } }, user: true },
    });
  },
  async markPaid(orderId: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        startDate: new Date(),
      },
      include: { package: true },
    });

    try {
      // Find FIFO available stock using FOR UPDATE SKIP LOCKED
      // and assign it directly to the order to prevent race conditions.
      const { stockService } = await import("@/lib/services/stock-service");
      const { subscriptionService } = await import("@/lib/services/subscription-service");
      
      const fulfillResult = await stockService.fulfillOrder(order.id, "SYSTEM_AUTO_ASSIGN");
      
      // Handle subscriptions if applicable
      await subscriptionService.handleOrderPaid(order.id);
      
      // Grant loyalty points
      const { loyaltyService } = await import("@/lib/services/loyalty-service");
      await loyaltyService.grantPointsFromOrder(order.id);
      
      if (fulfillResult.success && fulfillResult.stock) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            costPrice: order.package.costPrice || 0,
          },
        });
      }
    } catch (err) {
      console.error("Auto stock assignment failed:", err);
    }

    return order;
  },
  setEndDate(orderId: string, duration: number) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        endDate: addDays(new Date(), duration),
      },
    });
  },
  markExpired(orderId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.EXPIRED },
    });
  },
  findByInvoiceNo(invoiceNo: string) {
    return prisma.order.findFirst({
      where: { invoiceNo },
      include: { package: { include: { product: true } }, user: true, payment: true },
    });
  },
  findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { package: { include: { product: true } }, digitalStocks: true },
      orderBy: { createdAt: "desc" },
    });
  },
  findAll() {
    return prisma.order.findMany({
      include: { user: true, package: { include: { product: true } }, digitalStocks: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
