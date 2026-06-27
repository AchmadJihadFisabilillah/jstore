import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { hashSync } from "bcryptjs";
import { logAdminActivity } from "@/lib/utils/audit";

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.ADMINS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { not: "USER" },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove hashed passwords for security
    const sanitized = staff.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      permissions: s.permissions,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Failed to fetch staff:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requirePermission(PERMISSIONS.ADMINS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { name, email, password, role, permissions } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Semua field wajib diisi (name, email, password, role)" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email staff sudah digunakan" }, { status: 400 });
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: hashSync(password, 10),
        role,
        permissions: Array.isArray(permissions) ? permissions : [],
        isActive: true,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "CREATE_STAFF",
      module: "STAFF",
      details: `Membuat akun staff baru: ${created.name} (${created.email}) dengan role ${created.role}`,
      req,
    });

    return NextResponse.json({
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
    });
  } catch (error) {
    console.error("Failed to create staff:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
