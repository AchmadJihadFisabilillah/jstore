import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { errorResponse, handleApiError } from "@/lib/utils/api-response";
import { uploadFileLocally } from "@/lib/utils/upload";
import { manualQrisService } from "@/lib/services/payments/manual-qris-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    const { paymentId } = await params;
    
    // Check if payment belongs to the user
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) {
      return errorResponse("Payment not found", "NOT_FOUND", 404);
    }

    if (payment.order.userId !== session.user.id) {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const formData = await request.formData();
    const file = formData.get("proof") as File | null;
    
    if (!file || file.size === 0) {
      return errorResponse("File bukti pembayaran wajib diunggah", "BAD_REQUEST", 400);
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("Ukuran file maksimal 5MB", "BAD_REQUEST", 400);
    }

    // Allowed mime types
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!allowedMimeTypes.includes(file.type)) {
      return errorResponse("Format file tidak didukung (gunakan JPG, PNG, WEBP, atau PDF)", "BAD_REQUEST", 400);
    }

    const uploadResult = await uploadFileLocally(file, "proofs");

    const senderName = formData.get("senderName") as string || session.user.name || "Unknown";
    const senderAccount = formData.get("senderAccount") as string || "QRIS";
    const paymentTimeRaw = formData.get("paymentTime") as string;
    const paymentTime = paymentTimeRaw ? new Date(paymentTimeRaw) : new Date();
    const customerNote = formData.get("customerNote") as string || "";

    const updatedPayment = await manualQrisService.submitProof(paymentId, {
      proofUrl: uploadResult.url,
      proofOriginalName: uploadResult.originalName,
      proofMimeType: uploadResult.mimeType,
      proofSize: uploadResult.size,
      senderName,
      senderAccount,
      paymentTime,
      customerNote
    });

    // Create Audit Log
    await prisma.adminActivityLog.create({
      data: {
        userId: session.user.id, // User yang upload bukti
        action: payment.status === "REJECTED" ? "REUPLOAD_PROOF" : "UPLOAD_PROOF",
        module: "PAYMENT",
        details: `Customer uploaded proof for payment ${payment.id} / order ${payment.order.id}`,
      }
    });

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error) {
    return handleApiError(error);
  }
}
