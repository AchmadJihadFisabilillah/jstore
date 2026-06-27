import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { handleApiError, successResponse } from "@/lib/utils/api-response";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const notifications = await prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return successResponse(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { id } = body;

    if (id) {
      // Mark single notification as read
      const updated = await prisma.adminNotification.update({
        where: { id },
        data: { isRead: true },
      });
      return successResponse(updated);
    } else {
      // Mark all as read
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return successResponse({ success: true });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

