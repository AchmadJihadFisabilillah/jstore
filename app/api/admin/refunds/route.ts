import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.REFUND_PROCESS);
  if (!auth.ok) return auth.response;

  try {
    const refunds = await prisma.refund.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        order: {
          include: {
            package: {
              include: { product: true },
            },
          },
        },
      },
    });
    return NextResponse.json(refunds);
  } catch (error) {
    console.error("Failed to fetch refunds:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
