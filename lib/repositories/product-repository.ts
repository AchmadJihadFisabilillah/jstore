import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export interface ProductSearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  stockStatus?: string;
  activationType?: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  sortBy?: "popular" | "newest" | "price_asc" | "price_desc" | "discount";
  page?: number;
  limit?: number;
}

export const productRepository = {
  findAll() {
    return prisma.product.findMany({
      include: { packages: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { packages: true },
    });
  },

  async searchAndFilter(params: ProductSearchParams) {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      duration,
      stockStatus,
      activationType,
      isBestseller,
      isNew,
      isRecommended,
      sortBy = "popular",
      page = 1,
      limit = 12,
    } = params;

    const where: Prisma.ProductWhereInput = {
      isActive: true, // Only show active products to users
    };

    if (isBestseller !== undefined) where.isBestseller = isBestseller;
    if (isNew !== undefined) where.isNew = isNew;
    if (isRecommended !== undefined) where.isRecommended = isRecommended;

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { packages: { some: { name: { contains: q, mode: "insensitive" } } } },
      ];
    }

    if (category && category.toLowerCase() !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (activationType) {
      where.activationType = { equals: activationType, mode: "insensitive" };
    }

    // Package-level filters
    const packageFilter: Prisma.PackageWhereInput = { isActive: true };
    let hasPackageFilter = false;

    if (minPrice !== undefined || maxPrice !== undefined) {
      packageFilter.price = {};
      if (minPrice !== undefined) packageFilter.price.gte = minPrice;
      if (maxPrice !== undefined) packageFilter.price.lte = maxPrice;
      hasPackageFilter = true;
    }

    if (duration !== undefined) {
      packageFilter.duration = duration;
      hasPackageFilter = true;
    }

    if (stockStatus) {
      packageFilter.stockStatus = { equals: stockStatus, mode: "insensitive" };
      hasPackageFilter = true;
    }

    if (hasPackageFilter) {
      where.packages = { some: packageFilter };
    }

    // Determine orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "popular") {
      orderBy = { order: "desc" }; // We can use 'order' or 'recentViews' count later
    }
    // Note: Prisma doesn't natively sort outer records based on inner record aggregations (like min package price)
    // without complex raw queries. For now, we sort in JS or just use simple sorts if price/discount is chosen.

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { packages: { where: { isActive: true } } },
        orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Handle complex JS sorting if necessary
    let sortedProducts = products;
    if (sortBy === "price_asc") {
      sortedProducts.sort((a, b) => {
        const minA = a.packages.length ? Math.min(...a.packages.map(p => p.price)) : 0;
        const minB = b.packages.length ? Math.min(...b.packages.map(p => p.price)) : 0;
        return minA - minB;
      });
    } else if (sortBy === "price_desc") {
      sortedProducts.sort((a, b) => {
        const maxA = a.packages.length ? Math.max(...a.packages.map(p => p.price)) : 0;
        const maxB = b.packages.length ? Math.max(...b.packages.map(p => p.price)) : 0;
        return maxB - maxA;
      });
    } else if (sortBy === "discount") {
      sortedProducts.sort((a, b) => {
        const maxDiscA = a.packages.length ? Math.max(...a.packages.map(p => p.discount)) : 0;
        const maxDiscB = b.packages.length ? Math.max(...b.packages.map(p => p.discount)) : 0;
        return maxDiscB - maxDiscA;
      });
    }

    return {
      data: sortedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
