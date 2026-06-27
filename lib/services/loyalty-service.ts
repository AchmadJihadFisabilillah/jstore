import { prisma } from "@/lib/prisma/client";

export const loyaltyService = {
  /**
   * Adds loyalty points based on transaction amount.
   * For example, Rp 10.000 = 1 point.
   */
  async grantPointsFromOrder(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { package: true }
      });

      if (!order || !order.package || order.status !== "PAID") return;

      const amountSpent = order.package.price;
      if (amountSpent <= 0) return;

      // Calculate points (Rp 10.000 = 1 point)
      const pointsToGrant = Math.floor(amountSpent / 10000);
      
      if (pointsToGrant > 0) {
        // Ensure user has a LoyaltyPoint account
        let loyaltyAccount = await prisma.loyaltyPoint.findUnique({
          where: { userId: order.userId }
        });

        if (!loyaltyAccount) {
          loyaltyAccount = await prisma.loyaltyPoint.create({
            data: {
              userId: order.userId,
              balance: 0,
              level: "MEMBER"
            }
          });
        }

        // Add transaction and update balance
        await prisma.$transaction([
          prisma.loyaltyTransaction.create({
            data: {
              loyaltyPointId: loyaltyAccount.id,
              amount: pointsToGrant,
              type: "EARN",
              description: `Poin dari pesanan #${order.invoiceNo || order.id.slice(-8)}`
            }
          }),
          prisma.loyaltyPoint.update({
            where: { id: loyaltyAccount.id },
            data: { balance: { increment: pointsToGrant } }
          })
        ]);
        
        console.log(`[Loyalty] Granted ${pointsToGrant} points to user ${order.userId}`);
      }
    } catch (error) {
      console.error("[Loyalty] Failed to grant points:", error);
    }
  }
};
