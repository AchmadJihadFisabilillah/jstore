import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.CUSTOMERS_VIEW);
  if (!auth.ok) return auth.response;

  try {
    const customer = await prisma.user.findUnique({
      where: { id, role: "USER" },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            package: {
              include: { product: true },
            },
            digitalStocks: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Failed to fetch customer details:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.CUSTOMERS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json({ message: "isActive parameter is required" }, { status: 400 });
    }

    const customer = await prisma.user.findFirst({
      where: { id, role: "USER" },
    });

    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: isActive ? "UNBLOCK_CUSTOMER" : "BLOCK_CUSTOMER",
      module: "CUSTOMER",
      details: `${isActive ? "Membuka blokir" : "Memblokir"} akun pelanggan: ${customer.name} (${customer.email})`,
      req,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update customer status:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
