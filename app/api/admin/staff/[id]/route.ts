import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { hashSync } from "bcryptjs";
import { logAdminActivity } from "@/lib/utils/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.ADMINS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { name, email, password, role, permissions, isActive } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    if (email && email !== existing.email) {
      const conflict = await prisma.user.findUnique({ where: { email } });
      if (conflict) {
        return NextResponse.json({ message: "Email sudah digunakan oleh staff lain" }, { status: 400 });
      }
    }

    const updateData: any = {
      name: name || undefined,
      email: email || undefined,
      role: role || undefined,
      permissions: Array.isArray(permissions) ? permissions : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
    };

    if (password) {
      updateData.password = hashSync(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_STAFF",
      module: "STAFF",
      details: `Mengedit data staff: ${updated.name} (${updated.email})`,
      req,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
  } catch (error) {
    console.error("Failed to update staff:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.ADMINS_MANAGE);
  if (!auth.ok) return auth.response;

  // Prevent self deletion
  if (id === auth.session.user.id) {
    return NextResponse.json({ message: "Anda tidak dapat menghapus akun Anda sendiri" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "DELETE_STAFF",
      module: "STAFF",
      details: `Menghapus akun staff: ${existing.name} (${existing.email})`,
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete staff:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
