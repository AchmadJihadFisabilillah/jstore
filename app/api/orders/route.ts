import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { orderService } from "@/lib/services/order-service";
import { handleApiError, errorResponse } from "@/lib/utils/api-response";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser) {
    return errorResponse("User not found in database", "NOT_FOUND", 404);
  }

  try {
    const body = (await request.json()) as { packageId: string };
    const result = await orderService.createOrder({
      userId: session.user.id,
      packageId: body.packageId,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
