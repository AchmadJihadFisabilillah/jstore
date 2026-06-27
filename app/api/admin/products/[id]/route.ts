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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Resolve category name for backward compatibility
    let categoryName = existing.category;
    if (categoryId) {
      const catObj = await prisma.category.findUnique({ where: { id: categoryId } });
      if (catObj) {
        categoryName = catObj.name;
      }
    }

    // Process nested packages if provided
    if (Array.isArray(packages)) {
      // Verify SKU uniqueness for incoming packages
      const skus = packages.map((p) => p.sku).filter(Boolean);
      if (skus.length > 0) {
        const conflict = await prisma.package.findFirst({
          where: {
            sku: { in: skus },
            productId: { not: id },
          },
        });
        if (conflict) {
          return NextResponse.json(
            { message: `SKU "${conflict.sku}" sudah terdaftar pada produk lain.` },
            { status: 400 }
          );
        }
      }

      // 1. Get current package IDs in database for this product
      const currentDbPackages = await prisma.package.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const currentDbIds = currentDbPackages.map((p) => p.id);

      // 2. Identify package IDs to delete (those not in incoming packages)
      const incomingIds = packages.map((p) => p.id).filter(Boolean);
      const idsToDelete = currentDbIds.filter((dbId) => !incomingIds.includes(dbId));

      // 3. Delete removed packages (restrict delete if packages have orders)
      if (idsToDelete.length > 0) {
        const linkedToOrders = await prisma.order.findFirst({
          where: { packageId: { in: idsToDelete } },
        });

        if (linkedToOrders) {
          return NextResponse.json(
            {
              message:
                "Gagal menghapus beberapa varian. Varian tersebut telah memiliki riwayat pesanan/transaksi.",
            },
            { status: 400 }
          );
        }

        await prisma.package.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      // 4. Update or Create packages
      for (const pkg of packages) {
        const pkgData = {
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
        };

        if (pkg.id) {
          await prisma.package.update({
            where: { id: pkg.id },
            data: pkgData,
          });
        } else {
          await prisma.package.create({
            data: {
              ...pkgData,
              productId: id,
            },
          });
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        category: categoryName,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
        shortDesc: shortDesc !== undefined ? shortDesc : undefined,
        usageGuide: usageGuide !== undefined ? usageGuide : undefined,
        terms: terms !== undefined ? terms : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        isRecommended: isRecommended !== undefined ? Boolean(isRecommended) : undefined,
        isBestseller: isBestseller !== undefined ? Boolean(isBestseller) : undefined,
        isNew: isNew !== undefined ? Boolean(isNew) : undefined,
        order: order !== undefined ? Number(order) : undefined,
        seoTitle: seoTitle !== undefined ? seoTitle : undefined,
        seoDescription: seoDescription !== undefined ? seoDescription : undefined,
        brandColor: brandColor !== undefined ? brandColor : undefined,
        logoBackground: logoBackground !== undefined ? logoBackground : undefined,
        activationType: activationType !== undefined ? activationType : undefined,
        processingType: processingType !== undefined ? processingType : undefined,
        warrantyDuration: warrantyDuration !== undefined ? warrantyDuration : undefined,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_PRODUCT",
      module: "PRODUCT",
      details: `Mengedit produk: ${updated.name}`,
      req,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.PRODUCTS_DELETE);
  if (!auth.ok) return auth.response;

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        packages: {
          select: { id: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Check if any package is linked to orders
    const packageIds = existing.packages.map((p) => p.id);
    const linkedToOrders = await prisma.order.findFirst({
      where: { packageId: { in: packageIds } },
    });

    if (linkedToOrders) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus produk karena beberapa varian telah dipesan pembeli." },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id } });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "DELETE_PRODUCT",
      module: "PRODUCT",
      details: `Menghapus produk: ${existing.name}`,
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
