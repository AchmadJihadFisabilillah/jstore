import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { stockService } from "@/lib/services/stock-service";
import { logAdminActivity } from "@/lib/utils/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.STOCK_RESERVE);
  if (!auth.ok) return auth.response;

  try {
    const { reason } = await req.json();

    const result = await stockService.reserveStock(id, auth.session.user.id, reason || "Manual reserve");

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "RESERVE_STOCK",
      module: "STOCK",
      details: `Mereservasi stok ID: ${id} dengan alasan: ${reason || "Manual reserve"}`,
      req,
    });

    return NextResponse.json({ success: true, stock: result.stock });
  } catch (error: any) {
    console.error("Reserve stock endpoint error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
