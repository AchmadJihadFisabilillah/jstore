import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW);
  if (!auth.ok) return auth.response;

  try {
    const logs = await prisma.adminActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      take: 100, // Limit to recent 100 entries for performance
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
