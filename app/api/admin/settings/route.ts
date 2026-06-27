import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.SETTINGS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const settings = await prisma.setting.findMany();
    // Transform array to key-value object
    const config: Record<string, string> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });
    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requirePermission(PERMISSIONS.SETTINGS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json(); // Object containing key-value pairs

    const promises = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await prisma.$transaction(promises);

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_SYSTEM_SETTINGS",
      module: "SYSTEM",
      details: "Mengubah konfigurasi pengaturan utama sistem JStore",
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
