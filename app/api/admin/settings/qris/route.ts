import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { errorResponse, handleApiError } from "@/lib/utils/api-response";
import { uploadFileLocally } from "@/lib/utils/upload";

export async function GET() {
  const session = await getSession();
  // Ensure the user is admin (you can add a stricter check based on your RBAC)
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    const settings = await prisma.manualPaymentSetting.findFirst({
      where: { provider: "MANUAL_QRIS" }
    });
    return NextResponse.json(settings || {});
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    const formData = await request.formData();
    
    let qrisImageUrl = formData.get("existingImageUrl") as string;
    const file = formData.get("qrisImage") as File | null;
    
    if (file && file.size > 0) {
      const uploadResult = await uploadFileLocally(file, "qris");
      qrisImageUrl = uploadResult.url;
    }

    const merchantName = formData.get("merchantName") as string || "Toko";
    const instructions = formData.get("instructions") as string || "";
    const isActive = formData.get("isActive") === "true";
    const expiryMinutes = parseInt(formData.get("expiryMinutes") as string) || 1440;
    const whatsappNumber = formData.get("whatsappNumber") as string || "";

    const settings = await prisma.manualPaymentSetting.upsert({
      where: { provider: "MANUAL_QRIS" },
      update: {
        merchantName,
        qrisImageUrl,
        instructions,
        isActive,
        expiryMinutes,
        whatsappNumber,
        updatedById: session.user.id
      },
      create: {
        provider: "MANUAL_QRIS",
        merchantName,
        qrisImageUrl,
        instructions,
        isActive,
        expiryMinutes,
        whatsappNumber,
        updatedById: session.user.id
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return handleApiError(error);
  }
}
