import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { stockService } from "@/lib/services/stock-service";
import { logAdminActivity } from "@/lib/utils/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // id of the old stock
  const auth = await requirePermission(PERMISSIONS.STOCK_REPLACE);
  if (!auth.ok) return auth.response;

  try {
    const { orderId, reason } = await req.json();

    if (!orderId || !reason) {
      return NextResponse.json({ message: "orderId and reason are required" }, { status: 400 });
    }

    const result = await stockService.replaceStock(id, orderId, auth.session.user.id, reason);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "REPLACE_STOCK",
      module: "STOCK",
      details: `Mengganti stok ID: ${id} untuk Order ${orderId} dengan alasan: ${reason}`,
      req,
    });

    return NextResponse.json({ success: true, stock: result.stock });
  } catch (error: any) {
    console.error("Replace stock endpoint error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
