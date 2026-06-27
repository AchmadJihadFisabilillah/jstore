import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { errorResponse, handleApiError } from "@/lib/utils/api-response";
import { manualQrisService } from "@/lib/services/payments/manual-qris-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  // Permission check if permissions exist in the project
  // if (!session.user.permissions.includes("payments.verify")) { ... }

  try {
    const { paymentId } = await params;
    
    // Check if payment is already processed to prevent double execution
    const checkPayment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!checkPayment) {
      return errorResponse("Payment not found", "NOT_FOUND", 404);
    }
    if (checkPayment.status === "APPROVED") {
      return errorResponse("Pembayaran sudah disetujui sebelumnya", "BAD_REQUEST", 400);
    }

    const result = await manualQrisService.approvePayment(paymentId, session.user.id);

    await prisma.adminActivityLog.create({
      data: {
        userId: session.user.id,
        action: "APPROVE_PAYMENT",
        module: "PAYMENT",
        details: `Admin approved payment ${paymentId} for order ${result.order.id}`,
      }
    });

    return NextResponse.json({ success: true, message: "Pembayaran berhasil disetujui." });
  } catch (error) {
    return handleApiError(error);
  }
}
