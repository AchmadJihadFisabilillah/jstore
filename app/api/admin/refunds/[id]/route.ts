import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.REFUND_PROCESS);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        order: {
          include: { digitalStocks: true },
        },
      },
    });

    if (!refund) {
      return NextResponse.json({ message: "Refund claim not found" }, { status: 404 });
    }

    // Update refund
    const updated = await prisma.refund.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
        processedBy: auth.session.user.name,
      },
    });

    // If refund is APPROVED or REFUNDED, release the digital stock from the order
    // If refund is APPROVED or REFUNDED, release active digital stocks from the order
    if (["APPROVED", "REFUNDED"].includes(status) && refund.order.digitalStocks.length > 0) {
      const activeStock = refund.order.digitalStocks.find(s => s.status === "SOLD" || s.status === "RESERVED");
      if (activeStock) {
        await prisma.digitalStock.update({
          where: { id: activeStock.id },
          data: {
            status: "FAULTY", // Mark as faulty because it was refunded due to an issue
            orderId: null,
          },
        });
      }
    }

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "PROCESS_REFUND",
      module: "REFUND",
      details: `Memproses klaim refund #${refund.refundNo} menjadi status: ${status}`,
      req,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to process refund:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
