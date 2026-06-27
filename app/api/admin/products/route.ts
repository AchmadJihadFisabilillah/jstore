import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function GET() {
  const auth = await requirePermission(PERMISSIONS.PRODUCTS_VIEW);
  if (!auth.ok) return auth.response;

  try {
    const products = await prisma.product.findMany({
      orderBy: { order: "asc" },
      include: {
        categoryRel: true,
        packages: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: {
                digitalStocks: {
                  where: { status: "AVAILABLE" },
                },
              },
            },
          },
        },
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requirePermission(PERMISSIONS.PRODUCTS_CREATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const {
      name,
      description,
      categoryId,
      logoUrl,
      bannerUrl,
      shortDesc,
      usageGuide,
      terms,
      isActive,
      isRecommended,
      isBestseller,
      isNew,
      order,
      seoTitle,
      seoDescription,
      brandColor,
      logoBackground,
      activationType,
      processingType,
      warrantyDuration,
      packages, // Array of packages
    } = body;

    if (!name || !description) {
      return NextResponse.json({ message: "Name and Description are required" }, { status: 400 });
    }

    // Resolve category name for backward compatibility
    let categoryName = "Lainnya";
    if (categoryId) {
      const catObj = await prisma.category.findUnique({ where: { id: categoryId } });
      if (catObj) {
        categoryName = catObj.name;
      }
    }

    // Prepare packages create operations
    const packagesCreate = Array.isArray(packages)
      ? packages.map((pkg: any) => ({
          name: pkg.name,
          duration: Number(pkg.duration) || 30,
          price: Number(pkg.price) || 0,
          costPrice: Number(pkg.costPrice) || 0,
          originalPrice: Number(pkg.originalPrice) || 0,
          discount: Number(pkg.discount) || 0,
          warranty: pkg.warranty || "",
          description: pkg.description || "",
          sku: pkg.sku || null,
          isActive: pkg.isActive !== undefined ? Boolean(pkg.isActive) : true,
          order: Number(pkg.order) || 0,
          stockStatus: pkg.stockStatus || "Tersedia",
        }))
      : [];

    // Verify SKU uniqueness
    const skus = packagesCreate.map((p) => p.sku).filter(Boolean);
    if (skus.length > 0) {
      const existingSku = await prisma.package.findFirst({
        where: { sku: { in: skus } },
      });
      if (existingSku) {
        return NextResponse.json(
          { message: `SKU "${existingSku.sku}" sudah terdaftar pada produk lain.` },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category: categoryName,
        categoryId: categoryId || null,
        logoUrl,
        bannerUrl,
        shortDesc,
        usageGuide,
        terms,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isRecommended: Boolean(isRecommended),
        isBestseller: Boolean(isBestseller),
        isNew: Boolean(isNew),
        order: Number(order) || 0,
        seoTitle,
        seoDescription,
        brandColor,
        logoBackground,
        activationType,
        processingType,
        warrantyDuration,
        packages: {
          create: packagesCreate,
        },
      },
      include: {
        packages: true,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "CREATE_PRODUCT",
      module: "PRODUCT",
      details: `Membuat produk: ${product.name} dengan ${product.packages.length} varian`,
      req,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
