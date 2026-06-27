import { NextResponse } from "next/server";
import { PaymentFactory } from "@/lib/services/payments/payment-factory";
import { prisma } from "@/lib/prisma/client";
import { orderRepository } from "@/lib/repositories/order-repository";
import crypto from "crypto";
import { handleApiError, errorResponse, successResponse } from "@/lib/utils/api-response";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const provider = PaymentFactory.getProvider("MANDIRI");

    // 1. Verify Callback Signature
    const isSignatureValid = await provider.verifyWebhook(headers, rawBody);
    if (!isSignatureValid) {
      console.error("[Mandiri Webhook] Signature verification failed.");
      return errorResponse("Invalid signature.", "INVALID_SIGNATURE", 401);
    }

    // 2. Parse callback body
    const event = await provider.parseWebhook(rawBody);
    const payloadHash = crypto.createHash("sha256").update(rawBody).digest("hex");

    // 3. Process webhook event with idempotency check
    const existingEvent = await prisma.paymentWebhookEvent.findFirst({
      where: {
        provider: "MANDIRI",
        OR: [
          event.eventId ? { eventId: event.eventId } : {},
          { payloadHash },
        ],
      },
    });

    if (existingEvent?.processingStatus === "PROCESSED") {
      console.log(`[Mandiri Webhook] Event ${event.eventId} already processed (idempotent).`);
      return successResponse({ message: "Webhook already processed." });
    }

    // Register webhook event log as PENDING
    const logEvent = await prisma.paymentWebhookEvent.create({
      data: {
        provider: "MANDIRI",
        eventId: event.eventId || `EV-${Date.now()}`,
        providerTransactionId: event.providerTransactionId,
        signatureValid: true,
        eventType: "CALLBACK",
        processingStatus: "PENDING",
        payloadHash,
        payload: JSON.stringify({ transaction_id: event.providerTransactionId, amount: event.amount }),
      },
    });

    // 4. Update DB status inside database transaction with row locking
    await prisma.$transaction(async (tx) => {
      // Find and lock the payment record
      // PostgreSQL: SELECT * FROM "Payment" WHERE ... FOR UPDATE
      const payments: any[] = await tx.$queryRaw`
        SELECT id, status, amount, "orderId" FROM "Payment"
        WHERE "providerTransactionId" = ${event.providerTransactionId} AND provider = 'MANDIRI'
        FOR UPDATE
      `;

      if (payments.length === 0) {
        throw new Error("Data pembayaran tidak ditemukan.");
      }

      const payment = payments[0];

      if (payment.status === "PAID") {
        return; // Already processed
      }

      // Validate nominal matches the invoice amount
      if (payment.amount !== event.amount) {
        throw new Error(`Nominal callback tidak cocok. Expected: ${payment.amount}, Got: ${event.amount}`);
      }

      // Update payment status in tx
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          providerStatus: "SUCCESS",
        },
      });

      // Update Webhook Event Log status in tx
      await tx.paymentWebhookEvent.update({
        where: { id: logEvent.id },
        data: {
          processingStatus: "PROCESSED",
          processedAt: new Date(),
        },
      });
    });

    // 5. Trigger order fulfillment (markPaid and allocate stock digital credentials)
    // Run outside main lock transaction to prevent nested transaction block issues
    const finalPayment = await prisma.payment.findFirst({
      where: { providerTransactionId: event.providerTransactionId, provider: "MANDIRI" },
      include: { order: { include: { package: true } } },
    });

    if (finalPayment && finalPayment.order.status !== "PAID") {
      await orderRepository.markPaid(finalPayment.orderId);
      await orderRepository.setEndDate(finalPayment.orderId, finalPayment.order.package.duration);
    }

    return successResponse({ status: "SUCCESS", message: "Callback berhasil diproses." });
  } catch (error: any) {
    return handleApiError(error);
  }
}

