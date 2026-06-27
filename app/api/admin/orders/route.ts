import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: Request) {
  const auth = await requirePermission(PERMISSIONS.ORDERS_VIEW);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        package: {
          include: { product: true },
        },
        digitalStocks: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
