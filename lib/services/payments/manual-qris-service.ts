import { prisma } from "@/lib/prisma/client";
import { Order, User, Package, Product } from "@prisma/client";

type OrderWithRelations = Order & {
  user: User;
  package: Package & { product: Product };
};

export const manualQrisService = {
  async getSettings() {
    return prisma.manualPaymentSetting.findFirst({
      where: { provider: "MANUAL_QRIS" }
    });
  },

  async createPayment(order: OrderWithRelations) {
    const settings = await this.getSettings();
    if (!settings) {
      throw new Error("Manual QRIS settings not configured.");
    }

    const amount = order.package.price;
    const provider = "MANUAL_QRIS";
    const method = "QRIS";
    const idempotencyKey = `idemp-manual-${order.id}-${amount}`;

    // Waktu kedaluwarsa sesuai setting
    const expiredAt = new Date(Date.now() + settings.expiryMinutes * 60 * 1000);

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider,
        method,
        idempotencyKey,
        amount,
        status: "WAITING_PAYMENT",
        qrImageUrl: settings.qrisImageUrl, // Ambil dari setting merchant
        expiredAt,
      },
    });

    return {
      orderId: order.id,
      invoiceNo: order.invoiceNo!,
      amount,
      qrImageUrl: settings.qrisImageUrl,
      expiredAt,
      paymentStatus: payment.status,
    };
  },

  async submitProof(paymentId: string, proofData: {
    proofUrl: string;
    proofOriginalName: string;
    proofMimeType: string;
    proofSize: number;
    senderName: string;
    senderAccount: string;
    paymentTime: Date;
    customerNote?: string;
  }) {
    // Pastikan payment ada dan statusnya WAITING_PAYMENT atau REJECTED (bisa re-upload)
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "WAITING_PAYMENT" && payment.status !== "REJECTED") {
      throw new Error("Payment is not in a valid state to upload proof");
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "UNDER_REVIEW",
        proofUrl: proofData.proofUrl,
        proofOriginalName: proofData.proofOriginalName,
        proofMimeType: proofData.proofMimeType,
        proofSize: proofData.proofSize,
        senderName: proofData.senderName,
        senderAccount: proofData.senderAccount,
        paymentTime: proofData.paymentTime,
        customerNote: proofData.customerNote,
        submittedAt: new Date(),
      }
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: "PAYMENT_REVIEW", // Status yang baru ditambahkan di schema
      }
    });

    return updatedPayment;
  },

  async approvePayment(paymentId: string, adminId: string) {
    // 1. Transaction untuk mengubah status payment dan order
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { order: true }
      });

      if (!payment) throw new Error("Payment not found");
      if (payment.status !== "UNDER_REVIEW") throw new Error("Payment must be UNDER_REVIEW to approve");

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          reviewedAt: new Date(),
          processedById: adminId,
        }
      });

      const updatedOrder = await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID",
          startDate: new Date(), // Menandai langganan / order dimulai
        }
      });

      return { payment: updatedPayment, order: updatedOrder };
    });

    // 2. Fulfillment Stok
    try {
      const { stockService } = await import("@/lib/services/stock-service");
      const { subscriptionService } = await import("@/lib/services/subscription-service");
      const { loyaltyService } = await import("@/lib/services/loyalty-service");

      const fulfillResult = await stockService.fulfillOrder(result.order.id, "SYSTEM_AUTO_ASSIGN");

      await subscriptionService.handleOrderPaid(result.order.id);
      await loyaltyService.grantPointsFromOrder(result.order.id);

      if (fulfillResult.success && fulfillResult.stock) {
        // Update costPrice di order jika dapet stok
        const orderInfo = await prisma.order.findUnique({
          where: { id: result.order.id },
          include: { package: true }
        });
        
        if (orderInfo) {
          await prisma.order.update({
            where: { id: result.order.id },
            data: {
              costPrice: orderInfo.package.costPrice || 0,
            },
          });
        }
      } else {
        // Update order status menjadi WAITING_STOCK
        await prisma.order.update({
          where: { id: result.order.id },
          data: { status: "WAITING_STOCK" }
        });
      }
    } catch (error) {
      console.error("Fulfillment failed after manual approval", error);
      // Fallback ke WAITING_STOCK jika error
      await prisma.order.update({
        where: { id: result.order.id },
        data: { status: "WAITING_STOCK" }
      });
    }

    return result;
  },

  async rejectPayment(paymentId: string, adminId: string, reason: string) {
    if (!reason || reason.trim() === "") {
      throw new Error("Alasan penolakan harus diisi");
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { order: true }
      });

      if (!payment) throw new Error("Payment not found");
      if (payment.status !== "UNDER_REVIEW") throw new Error("Payment must be UNDER_REVIEW to reject");

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
          rejectedAt: new Date(),
          reviewedAt: new Date(),
          processedById: adminId,
        }
      });

      // Kembalikan status order ke PENDING
      const updatedOrder = await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PENDING", // PENDING (menunggu pembayaran)
          rejectionReason: reason,
        }
      });

      return { payment: updatedPayment, order: updatedOrder };
    });

    return result;
  }
};
