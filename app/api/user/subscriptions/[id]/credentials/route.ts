import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { handleApiError, errorResponse, successResponse } from "@/lib/utils/api-response";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { digitalStocks: true },
    });

    if (!order || order.userId !== session.user.id) {
      return errorResponse("Not found or forbidden", "FORBIDDEN", 403);
    }

    if (order.status !== "PAID") {
      return errorResponse("Pesanan belum dibayar (Lunas). Kredensial belum bisa diakses.", "ORDER_NOT_PAID", 403);
    }

    // Get the active (SOLD/assigned) stock for this order
    const digitalStock = order.digitalStocks.find(s => s.status === "SOLD");

    if (!digitalStock) {
      return errorResponse("Kredensial belum dialokasikan", "NOT_FOUND", 404);
    }

    // Note: We use NextResponse directly here because successResponse might wrap it
    // in a shape that the Frontend (CredentialsCard) doesn't expect.
    // CredentialsCard expects raw object: { email, password, pin... }
    return NextResponse.json({
      email: digitalStock.email,
      password: digitalStock.password,
      pin: digitalStock.pin,
      profile: digitalStock.profile,
      code: digitalStock.code,
      link: digitalStock.link,
      notes: digitalStock.notes
    });
  } catch (error) {
    return handleApiError(error);
  }
}

