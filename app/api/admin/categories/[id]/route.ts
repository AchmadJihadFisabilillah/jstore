import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.PRODUCTS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { name, slug, description, icon, color, order, isActive } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    // Check unique constraints for other rows
    if (name || slug) {
      const conflict = await prisma.category.findFirst({
        where: {
          id: { not: id },
          OR: [
            name ? { name } : {},
            slug ? { slug } : {},
          ].filter((o) => Object.keys(o).length > 0),
        },
      });

      if (conflict) {
        return NextResponse.json(
          { message: "Nama atau Slug kategori sudah digunakan" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug ? slug.toLowerCase().replace(/\s+/g, "-") : undefined,
        description: description !== undefined ? description : undefined,
        icon: icon !== undefined ? icon : undefined,
        color: color !== undefined ? color : undefined,
        order: order !== undefined ? Number(order) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_CATEGORY",
      module: "CATEGORY",
      details: `Mengedit kategori: ${updated.name}`,
      req,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.PRODUCTS_DELETE);
  if (!auth.ok) return auth.response;

  try {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus kategori yang masih memiliki produk" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "DELETE_CATEGORY",
      module: "CATEGORY",
      details: `Menghapus kategori: ${existing.name}`,
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
