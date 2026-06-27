import { NextResponse } from "next/server";
import { stockService } from "@/lib/services/stock-service";
import { handleApiError, successResponse } from "@/lib/utils/api-response";

// This should ideally be protected by an Authorization header (e.g. CRON_SECRET)
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Release any expired reservations
    const result = await stockService.releaseExpiredReservations();

    return successResponse({
      success: true,
      message: `Berhasil melepas ${result.releasedCount} reservasi yang kadaluwarsa.`,
      releasedCount: result.releasedCount,
    });
  } catch (error: any) {
    console.error("Cron Order Stock Error:", error);
    return handleApiError(error);
  }
}
