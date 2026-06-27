import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.STOCK_ASSIGN_TO_ORDER);
  if (!auth.ok) return auth.response;

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: "orderId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.digitalStock.findUnique({ where: { id } });
      if (!stock) throw new Error("Stok tidak ditemukan");
      if (stock.status !== "RESERVED" && stock.status !== "AVAILABLE") {
        throw new Error("Stok ini tidak bisa di-assign (status: " + stock.status + ")");
      }

      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order tidak ditemukan");

      const updated = await tx.digitalStock.update({
        where: { id },
        data: {
          status: "SOLD",
          orderId,
          assignedToUserId: order.userId,
          assignedAt: new Date(),
          reservedByAdminId: null,
          reservedAt: null,
          reservationExpiresAt: null,
        },
      });

      await tx.stockMovement.create({
        data: {
          stockId: id,
          action: "ASSIGN",
          fromStatus: stock.status,
          toStatus: "SOLD",
          orderId,
          customerId: order.userId,
          adminId: auth.session.user.id,
          reason: "Manual assign",
        },
      });

      return updated;
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "ASSIGN_STOCK",
      module: "STOCK",
      details: `Assign stok ID: ${id} ke Order: ${orderId}`,
      req,
    });

    return NextResponse.json({ success: true, stock: result });
  } catch (error: any) {
    console.error("Assign stock endpoint error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
