import { prisma } from "@/lib/prisma/client";
import { addDays } from "date-fns";

export const subscriptionService = {
  /**
   * Called when an order becomes PAID.
   * If the package has a duration > 0, it manages the Subscription.
   */
  async handleOrderPaid(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { package: true },
      });

      if (!order) throw new Error("Order not found");

      const duration = order.package.duration;
      if (duration <= 0) {
        return; // Not a subscription product
      }

      // Check if user already has an active subscription for this package
      const existingSub = await prisma.subscription.findFirst({
        where: {
          userId: order.userId,
          packageId: order.packageId,
          status: { in: ["ACTIVE", "EXPIRING"] },
        },
      });

      if (existingSub) {
        // Renew existing subscription
        const newEndDate = addDays(existingSub.endDate, duration);

        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            endDate: newEndDate,
            status: "ACTIVE", // Reset status to active in case it was expiring
          },
        });

        await prisma.subscriptionRenewal.create({
          data: {
            subscriptionId: existingSub.id,
            orderId: order.id,
            renewedAt: new Date(),
          },
        });
      } else {
        // Create new subscription
        await prisma.subscription.create({
          data: {
            userId: order.userId,
            packageId: order.packageId,
            orderId: order.id,
            startDate: new Date(),
            endDate: addDays(new Date(), duration),
            status: "ACTIVE",
          },
        });
      }
    } catch (error) {
      console.error("Subscription Service Error [handleOrderPaid]:", error);
    }
  },
};
