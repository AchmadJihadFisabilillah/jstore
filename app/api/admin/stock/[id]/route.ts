import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { encrypt } from "@/lib/utils/encryption";
import { logAdminActivity } from "@/lib/utils/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.STOCK_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { email, password, pin, code, link, profile, notes, status, expiryDate } = body;

    const existing = await prisma.digitalStock.findUnique({
      where: { id },
      include: {
        package: {
          include: { product: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Stock item not found" }, { status: 404 });
    }

    const updateData: any = {
      email: email !== undefined ? email : undefined,
      pin: pin !== undefined ? pin : undefined,
      code: code !== undefined ? code : undefined,
      link: link !== undefined ? link : undefined,
      profile: profile !== undefined ? profile : undefined,
      notes: notes !== undefined ? notes : undefined,
      status: status !== undefined ? status : undefined,
      expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : undefined,
    };

    // If password is being changed, encrypt it first!
    if (password) {
      updateData.password = encrypt(password);
    }

    const updated = await prisma.digitalStock.update({
      where: { id },
      data: updateData,
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_STOCK",
      module: "STOCK",
      details: `Mengubah stok ID: ${id} (${existing.package.product.name} - ${existing.package.name})`,
      req,
    });

    return NextResponse.json({
      ...updated,
      password: updated.password ? "••••••••" : null,
      pin: updated.pin ? "••••" : null,
    });
  } catch (error) {
    console.error("Failed to update digital stock:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.STOCK_DELETE);
  if (!auth.ok) return auth.response;

  try {
    const existing = await prisma.digitalStock.findUnique({
      where: { id },
      include: {
        package: {
          include: { product: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Stock item not found" }, { status: 404 });
    }

    if (existing.status === "RESERVED" || existing.status === "SOLD") {
      return NextResponse.json(
        { message: "Tidak dapat menghapus stok yang sudah dipesan atau terjual." },
        { status: 400 }
      );
    }

    await prisma.digitalStock.delete({ where: { id } });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "DELETE_STOCK",
      module: "STOCK",
      details: `Menghapus stok ID: ${id} (${existing.package.product.name} - ${existing.package.name})`,
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete digital stock:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
