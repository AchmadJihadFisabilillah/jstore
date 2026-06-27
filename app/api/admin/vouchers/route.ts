import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.SETTINGS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });
    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("Failed to fetch vouchers:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requirePermission(PERMISSIONS.SETTINGS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const {
      code,
      name,
      discountType, // NOMINAL or PERCENTAGE
      discountValue,
      maxDiscount,
      minPurchase,
      quota,
      maxPerUser,
      startDate,
      endDate,
      isActive,
    } = body;

    if (!code || !name || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Semua field wajib diisi (code, name, discountType, discountValue, dates)" },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().replace(/\s+/g, "");

    // Verify uniqueness
    const existing = await prisma.voucher.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return NextResponse.json(
        { message: `Kode voucher "${cleanCode}" sudah digunakan.` },
        { status: 400 }
      );
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: cleanCode,
        name,
        discountType,
        discountValue: Number(discountValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        minPurchase: Number(minPurchase) || 0,
        quota: Number(quota) || 999,
        maxPerUser: Number(maxPerUser) || 1,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "CREATE_VOUCHER",
      module: "PROMO",
      details: `Membuat voucher diskon baru: ${voucher.code} (${voucher.name})`,
      req,
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    console.error("Failed to create voucher:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
