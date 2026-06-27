import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.PRODUCTS_VIEW);
  if (!auth.ok) return auth.response;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requirePermission(PERMISSIONS.PRODUCTS_CREATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { name, slug, description, icon, color, order, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: "Name and Slug are required" }, { status: 400 });
    }

    // Check if slug or name is unique
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Nama atau Slug kategori sudah digunakan" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        description,
        icon: icon || "LayoutGrid",
        color: color || "gray",
        order: Number(order) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "CREATE_CATEGORY",
      module: "CATEGORY",
      details: `Membuat kategori: ${category.name} (${category.slug})`,
      req,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
