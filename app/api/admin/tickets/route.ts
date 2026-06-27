import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: Request) {
  const auth = await requirePermission(PERMISSIONS.TICKETS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Failed to fetch support tickets:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
