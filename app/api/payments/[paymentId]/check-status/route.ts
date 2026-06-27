import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { PaymentFactory } from "@/lib/services/payments/payment-factory";
import { orderRepository } from "@/lib/repositories/order-repository";
import { handleApiError, errorResponse, successResponse } from "@/lib/utils/api-response";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    if (!paymentId) {
      return errorResponse("Payment ID wajib disertakan.", "MISSING_PAYMENT_ID", 400);
    }

    // 1. Fetch payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { package: true } } },
    });

    if (!payment) {
      return errorResponse("Pembayaran tidak ditemukan.", "PAYMENT_NOT_FOUND", 404);
    }

    // 2. Fetch live status from Mandiri API using the configured provider
    const provider = PaymentFactory.getProvider(payment.provider);
    const statusResult = await provider.getStatus(payment.providerTransactionId || "");

    // 3. If provider confirms payment is SUCCESS but our DB status is PENDING, process fulfillment
    if (statusResult.status === "paid" && payment.status !== "PAID") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            providerStatus: "SUCCESS",
          },
        });
      });

      // Mark order paid & trigger stock assignment
      if (payment.order.status !== "PAID") {
        await orderRepository.markPaid(payment.orderId);
        await orderRepository.setEndDate(payment.orderId, payment.order.package.duration);
      }
    }

    // Return the updated status to the client
    const updatedPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    return successResponse({
      status: updatedPayment?.status || payment.status,
      expiredAt: payment.expiredAt,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

