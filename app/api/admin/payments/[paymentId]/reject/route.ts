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

  try {
    const { paymentId } = await params;
    const body = await request.json();
    const reason = body.reason as string;

    if (!reason || reason.trim() === "") {
      return errorResponse("Alasan penolakan harus diisi", "BAD_REQUEST", 400);
    }

    const result = await manualQrisService.rejectPayment(paymentId, session.user.id, reason);

    await prisma.adminActivityLog.create({
      data: {
        userId: session.user.id,
        action: "REJECT_PAYMENT",
        module: "PAYMENT",
        details: `Admin rejected payment ${paymentId} for order ${result.order.id}. Reason: ${reason}`,
      }
    });

    return NextResponse.json({ success: true, message: "Pembayaran berhasil ditolak." });
  } catch (error) {
    return handleApiError(error);
  }
}
