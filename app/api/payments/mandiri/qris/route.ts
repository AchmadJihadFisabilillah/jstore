import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { orderService } from "@/lib/services/order-service";
import { handleApiError, errorResponse, successResponse } from "@/lib/utils/api-response";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return errorResponse("Order ID wajib dikirim.", "MISSING_ORDER_ID", 400);
    }

    // 1. Fetch order and verify ownership & status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { package: true },
    });

    if (!order) {
      return errorResponse("Pesanan tidak ditemukan.", "ORDER_NOT_FOUND", 404);
    }

    if (order.userId !== session.user.id) {
      return errorResponse("Akses ditolak.", "FORBIDDEN", 403);
    }

    if (order.status !== "PENDING") {
      return errorResponse("Pesanan sudah diproses atau kedaluwarsa.", "INVALID_ORDER_STATUS", 400);
    }

    // 2. Check if there is already an active pending payment for this order to apply idempotency
    const activePayment = await prisma.payment.findFirst({
      where: {
        orderId,
        provider: "MANDIRI",
        status: "PENDING",
        expiredAt: { gt: new Date() },
      },
    });

    if (activePayment) {
      return successResponse({
        orderId: order.id,
        invoiceNo: order.invoiceNo,
        amount: activePayment.amount,
        qrPayload: activePayment.qrPayload,
        qrImageUrl: activePayment.qrImageUrl,
        expiredAt: activePayment.expiredAt,
        paymentStatus: activePayment.status,
      });
    }

    // Gateway dinonaktifkan
    return errorResponse("Gateway pembayaran otomatis dinonaktifkan sementara.", "DISABLED", 400);

    // Dead code removed
  } catch (error: any) {
    return handleApiError(error);
  }
}

