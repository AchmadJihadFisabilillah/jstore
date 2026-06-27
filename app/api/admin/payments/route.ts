import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: Request) {
  // Enforce admin permission for viewing finance/payment data
  const auth = await requirePermission(PERMISSIONS.ORDERS_VIEW);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {
      // Exclude MANUAL provider since they are handled in the old verification flow
      NOT: { provider: "MANUAL" },
    };

    if (search) {
      where.OR = [
        { order: { invoiceNo: { contains: search, mode: "insensitive" } } },
        { providerTransactionId: { contains: search, mode: "insensitive" } },
        { order: { user: { name: { contains: search, mode: "insensitive" } } } },
        { order: { user: { email: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            user: true,
            package: { include: { product: true } },
          },
        },
        attempts: true,
      },
    });

    // Also fetch webhook events for logs
    const webhookEvents = await prisma.paymentWebhookEvent.findMany({
      orderBy: { receivedAt: "desc" },
      take: 50, // limit to last 50 events
    });

    return NextResponse.json({ payments, webhookEvents });
  } catch (error) {
    console.error("Failed to fetch admin payments:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
