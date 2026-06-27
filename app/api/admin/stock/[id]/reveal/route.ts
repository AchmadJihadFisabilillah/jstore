import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { decrypt } from "@/lib/utils/encryption";
import { logAdminActivity } from "@/lib/utils/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.STOCK_REVEAL);
  if (!auth.ok) return auth.response;

  try {
    const stock = await prisma.digitalStock.findUnique({
      where: { id },
      include: {
        package: {
          include: { product: true },
        },
      },
    });

    if (!stock) {
      return NextResponse.json({ message: "Stock item not found" }, { status: 404 });
    }

    // Decrypt credentials
    const decryptedPassword = stock.password ? decrypt(stock.password) : null;
    const decryptedPin = stock.pin || null;
    const decryptedCode = stock.code || null;

    // Log the reveal action for security auditing
    await logAdminActivity({
      userId: auth.session.user.id,
      action: "REVEAL_STOCK_CREDENTIAL",
      module: "STOCK",
      details: `Mengungkap kredensial sensitif untuk stok ID: ${id} (${stock.package.product.name} - ${stock.package.name}) - Email: ${stock.email || "N/A"}`,
      req,
    });

    return NextResponse.json({
      password: decryptedPassword,
      pin: decryptedPin,
      code: decryptedCode,
    });
  } catch (error) {
    console.error("Failed to reveal stock credentials:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
