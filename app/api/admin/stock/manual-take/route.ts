import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { stockService } from "@/lib/services/stock-service";
import { logAdminActivity } from "@/lib/utils/audit";

export async function POST(req: Request) {
  const auth = await requirePermission(PERMISSIONS.STOCK_MANUAL_TAKE);
  if (!auth.ok) return auth.response;

  try {
    const { stockId, reason } = await req.json();

    if (!stockId || !reason) {
      return NextResponse.json({ message: "stockId and reason are required" }, { status: 400 });
    }

    const result = await stockService.manualTake(stockId, auth.session.user.id, reason);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "MANUAL_TAKE_STOCK",
      module: "STOCK",
      details: `Mengambil stok manual ID: ${stockId} dengan alasan: ${reason}`,
      req,
    });

    return NextResponse.json({ success: true, stock: result.stock });
  } catch (error: any) {
    console.error("Manual take stock endpoint error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
