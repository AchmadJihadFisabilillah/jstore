import { productRepository, ProductSearchParams } from "@/lib/repositories/product-repository";
import { ProductCatalog } from "@/components/product/product-catalog";
import { SectionReveal } from "@/components/shared/section-reveal";

export const metadata = {
  title: "Katalog Produk Premium - JStore",
  description: "Temukan semua layanan premium terbaik dengan harga hemat, legal, dan bergaransi penuh di JStore.",
};

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const params: ProductSearchParams = {
    q: typeof resolvedParams.q === "string" ? resolvedParams.q : undefined,
    category: typeof resolvedParams.category === "string" ? resolvedParams.category : undefined,
    minPrice: resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined,
    maxPrice: resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined,
    duration: resolvedParams.duration ? Number(resolvedParams.duration) : undefined,
    stockStatus: typeof resolvedParams.stockStatus === "string" ? resolvedParams.stockStatus : undefined,
    activationType: typeof resolvedParams.activationType === "string" ? resolvedParams.activationType : undefined,
    sortBy: typeof resolvedParams.sortBy === "string" ? (resolvedParams.sortBy as any) : "popular",
    page: resolvedParams.page ? Number(resolvedParams.page) : 1,
    limit: 12,
  };

  const isSearchActive = Boolean(
    resolvedParams.q ||
    (resolvedParams.category && resolvedParams.category !== "all") ||
    resolvedParams.minPrice ||
    resolvedParams.maxPrice ||
    resolvedParams.duration ||
    resolvedParams.stockStatus ||
    resolvedParams.activationType ||
    (resolvedParams.sortBy && resolvedParams.sortBy !== "popular")
  );

  const { data, pagination } = await productRepository.searchAndFilter(params);

  let groupedData = null;
  if (!isSearchActive && params.page === 1) {
    const [bestsellersRes, newRes, recommendedRes] = await Promise.all([
      productRepository.searchAndFilter({ isBestseller: true, limit: 4 }),
      productRepository.searchAndFilter({ isNew: true, limit: 4 }),
      productRepository.searchAndFilter({ isRecommended: true, limit: 4 }),
    ]);
    groupedData = {
      bestsellers: bestsellersRes.data,
      newest: newRes.data,
      recommended: recommendedRes.data
    };
  }

  return (
    <div className="relative min-h-screen pb-24 pt-12 md:pt-16">
      <div className="container-jstore">
        {/* Dynamic Products Catalog Component */}
        <SectionReveal delay={0.08}>
          <ProductCatalog 
            initialData={data} 
            pagination={pagination} 
            groupedData={groupedData}
            isSearchActive={isSearchActive}
          />
        </SectionReveal>
      </div>
    </div>
  );
}
