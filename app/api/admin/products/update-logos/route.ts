import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { resolveLogoSlug, getProductColor } from "@/lib/utils/logo-mapping";
import { logAdminActivity } from "@/lib/utils/audit";

/**
 * POST /api/admin/products/update-logos
 * One-time or repeatable action to auto-assign logo URLs to products
 * based on name matching against the asset manifest.
 */
export async function POST(req: Request) {
  const auth = await requirePermission(PERMISSIONS.PRODUCTS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const products = await prisma.product.findMany();
    let updatedCount = 0;

    for (const product of products) {
      const slug = resolveLogoSlug(product.name);
      if (slug) {
        const logoUrl = `/assets/apps/png/${slug}.png`;
        const logoSvgUrl = `/assets/apps/svg/${slug}.svg`;
        const dominantColor = getProductColor(product.name);

        // Only update if logoUrl is not already set or is different
        if (product.logoUrl !== logoUrl) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              logoUrl,
              logoSvgUrl,
              logoAlt: `Logo ${product.name}`,
              dominantColor,
            },
          });
          updatedCount++;
        }
      }
    }

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_PRODUCT_LOGOS",
      module: "PRODUCT",
      details: `Auto-assigned logo untuk ${updatedCount} produk dari ${products.length} total`,
      req,
    });

    return NextResponse.json({
      success: true,
      total: products.length,
      updated: updatedCount,
    });
  } catch (error) {
    console.error("Failed to update product logos:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
