import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.SETTINGS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const {
      code,
      name,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      quota,
      maxPerUser,
      startDate,
      endDate,
      isActive,
    } = body;

    const existing = await prisma.voucher.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Voucher not found" }, { status: 404 });
    }

    const cleanCode = code ? code.toUpperCase().replace(/\s+/g, "") : undefined;

    // Verify uniqueness if code changes
    if (cleanCode && cleanCode !== existing.code) {
      const conflict = await prisma.voucher.findUnique({ where: { code: cleanCode } });
      if (conflict) {
        return NextResponse.json(
          { message: `Kode voucher "${cleanCode}" sudah digunakan.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.voucher.update({
      where: { id },
      data: {
        code: cleanCode,
        name: name || undefined,
        discountType: discountType || undefined,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        maxDiscount: maxDiscount !== undefined ? (maxDiscount ? Number(maxDiscount) : null) : undefined,
        minPurchase: minPurchase !== undefined ? Number(minPurchase) : undefined,
        quota: quota !== undefined ? Number(quota) : undefined,
        maxPerUser: maxPerUser !== undefined ? Number(maxPerUser) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_VOUCHER",
      module: "PROMO",
      details: `Mengubah voucher diskon: ${updated.code}`,
      req,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update voucher:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.SETTINGS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const existing = await prisma.voucher.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Voucher not found" }, { status: 404 });
    }

    if (existing._count.usages > 0) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus voucher yang sudah pernah digunakan oleh pelanggan." },
        { status: 400 }
      );
    }

    await prisma.voucher.delete({ where: { id } });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "DELETE_VOUCHER",
      module: "PROMO",
      details: `Menghapus voucher diskon: ${existing.code}`,
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete voucher:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
