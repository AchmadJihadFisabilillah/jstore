import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { stockService } from "@/lib/services/stock-service";
import { logAdminActivity } from "@/lib/utils/audit";

export async function POST(req: Request) {
  const auth = await requirePermission(PERMISSIONS.ORDERS_FULFILL);
  if (!auth.ok) return auth.response;

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: "orderId is required" }, { status: 400 });
    }

    const result = await stockService.fulfillOrder(orderId, auth.session.user.id);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "FULFILL_ORDER",
      module: "ORDER",
      details: `Memenuhi pesanan ${orderId} dengan stok otomatis ID: ${result.stock?.id}`,
      req,
    });

    return NextResponse.json({ success: true, stock: result.stock });
  } catch (error: any) {
    console.error("Take stock endpoint error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
