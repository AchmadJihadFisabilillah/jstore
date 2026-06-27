import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { encrypt } from "@/lib/utils/encryption";
import { logAdminActivity } from "@/lib/utils/audit";

export async function GET(req: Request) {
  const auth = await requirePermission(PERMISSIONS.STOCK_VIEW);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get("packageId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (packageId) where.packageId = packageId;
    if (status) where.status = status;
    if (type) where.type = type;

    const stocks = await prisma.digitalStock.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        package: {
          include: { product: true },
        },
        order: true,
      },
    });

    // Mask passwords for safety in standard GET requests.
    // Reveal action will be a separate POST request which logs the activity!
    const maskedStocks = stocks.map((s) => ({
      ...s,
      password: s.password ? "••••••••" : null,
      pin: s.pin ? "••••" : null,
    }));

    return NextResponse.json(maskedStocks);
  } catch (error) {
    console.error("Failed to fetch digital stocks:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requirePermission(PERMISSIONS.STOCK_CREATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const {
      packageId,
      type, // EMAIL_PASSWORD, LICENSE_KEY, etc.
      isBulk,
      bulkText, // Bulk inputs separated by newlines
      // Single stock fields
      email,
      password,
      pin,
      code,
      link,
      profile,
      notes,
      expiryDate,
      supplierId,
    } = body;

    if (!packageId || !type) {
      return NextResponse.json({ message: "Package ID and Stock Type are required" }, { status: 400 });
    }

    const packageExists = await prisma.package.findUnique({
      where: { id: packageId },
      include: { product: true },
    });
    if (!packageExists) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 });
    }

    let createdCount = 0;

    if (isBulk && bulkText) {
      const lines = bulkText.split("\n").map((line: string) => line.trim()).filter(Boolean);
      
      const creationData = [];

      for (const line of lines) {
        if (type === "EMAIL_PASSWORD") {
          // Format: email|password|pin|profile|notes
          const parts = line.split("|");
          const lineEmail = parts[0]?.trim();
          const linePass = parts[1]?.trim();
          const linePin = parts[2]?.trim() || null;
          const lineProfile = parts[3]?.trim() || null;
          const lineNotes = parts[4]?.trim() || null;

          if (lineEmail && linePass) {
            creationData.push({
              packageId,
              type,
              email: lineEmail,
              password: encrypt(linePass),
              pin: linePin,
              profile: lineProfile,
              notes: lineNotes,
              status: "AVAILABLE",
              adminId: auth.session.user.id,
              supplierId: supplierId || null,
            });
          }
        } else if (type === "LICENSE_KEY") {
          // Format: licenseCode|notes
          const parts = line.split("|");
          const lineCode = parts[0]?.trim();
          const lineNotes = parts[1]?.trim() || null;

          if (lineCode) {
            creationData.push({
              packageId,
              type,
              code: lineCode,
              notes: lineNotes,
              status: "AVAILABLE",
              adminId: auth.session.user.id,
              supplierId: supplierId || null,
            });
          }
        } else {
          // Other types generic line entry
          creationData.push({
            packageId,
            type,
            notes: line,
            status: "AVAILABLE",
            adminId: auth.session.user.id,
            supplierId: supplierId || null,
          });
        }
      }

      if (creationData.length > 0) {
        const result = await prisma.digitalStock.createMany({
          data: creationData,
        });
        createdCount = result.count;
      }
    } else {
      // Create single stock
      const data: any = {
        packageId,
        type,
        email: email || null,
        password: password ? encrypt(password) : null,
        pin: pin || null,
        code: code || null,
        link: link || null,
        profile: profile || null,
        notes: notes || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: "AVAILABLE",
        adminId: auth.session.user.id,
        supplierId: supplierId || null,
      };

      await prisma.digitalStock.create({ data });
      createdCount = 1;
    }

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "ADD_STOCK",
      module: "STOCK",
      details: `Menambah ${createdCount} stok digital baru untuk varian ${packageExists.product.name} - ${packageExists.name}`,
      req,
    });

    return NextResponse.json({ success: true, count: createdCount }, { status: 201 });
  } catch (error) {
    console.error("Failed to add digital stock:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
