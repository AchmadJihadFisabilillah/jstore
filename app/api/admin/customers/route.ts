import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.CUSTOMERS_VIEW);
  if (!auth.ok) return auth.response;

  try {
    const customers = await prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          select: {
            package: {
              select: {
                price: true,
              },
            },
          },
        },
      },
    });

    // Format transaction counts and total spending for easier UI rendering
    const formatted = customers.map((c) => {
      const totalSpend = c.orders.reduce((sum, o) => sum + o.package.price, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        isActive: c.isActive,
        createdAt: c.createdAt,
        ordersCount: c._count.orders,
        totalSpend,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
