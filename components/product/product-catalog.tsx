"use client";

import { useState, useEffect } from "react";
import { FilterToolbar } from "./filter-toolbar";
import { CategoryChips } from "./category-chips";
import { ProductCard } from "./product-card";
import { QuickPreviewModal } from "./quick-preview-modal";
import { CatalogHero } from "./catalog-hero";
import { useSearchParams } from "next/navigation";
import { PackageOpen, Loader2, TrendingUp, Sparkles, Zap, Grid } from "lucide-react";
import Link from "next/link";

export interface ProductCatalogProps {
  initialData: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  groupedData?: {
    bestsellers: any[];
    newest: any[];
    recommended: any[];
  } | null;
  isSearchActive: boolean;
}

export function ProductCatalog({ initialData, pagination, groupedData, isSearchActive }: ProductCatalogProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [totalPages, setTotalPages] = useState(pagination.totalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  // Sync state when initialData changes due to URL/filter changes (Server Component re-render)
  useEffect(() => {
    setProducts(initialData);
    setCurrentPage(pagination.page);
    setTotalPages(pagination.totalPages);
  }, [initialData, pagination]);

  const loadMore = async () => {
    if (currentPage >= totalPages || isLoadingMore) return;
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    // Construct search query
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nextPage.toString());
    
    try {
      const res = await fetch(`/api/products/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more");
      
      const json = await res.json();
      setProducts(prev => [...prev, ...json.data]);
      setCurrentPage(json.pagination.page);
      setTotalPages(json.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderProductGrid = (items: any[]) => (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onQuickPreview={() => setPreviewProduct(product)} 
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto">
      {!isSearchActive && <CatalogHero totalProducts={pagination.total} />}

      {/* Navigation & Filters */}
      <div className="flex flex-col gap-4">
        <CategoryChips />
        <FilterToolbar totalProducts={pagination.total} />
      </div>

      {/* Main Content Area */}
      <div className="w-full min-w-0 mt-2">
        {/* Empty State */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-3xl bg-card/30">
            <PackageOpen size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Produk tidak ditemukan</h3>
            <p className="text-muted-foreground max-w-sm">Coba ubah kata kunci atau hapus beberapa filter.</p>
            <Link href="/produk" className="mt-6 px-6 py-2.5 rounded-xl border border-violet-500/30 text-violet-400 font-bold hover:bg-violet-500/10 transition-colors">
              Reset Semua Filter
            </Link>
          </div>
        ) : (
          <>
            {/* If NO search/filter is active, show grouped sections */}
            {!isSearchActive && groupedData ? (
              <div className="space-y-16">
                {/* Produk Terlaris */}
                {groupedData.bestsellers.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
                        <TrendingUp size={20} />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Produk Terlaris</h2>
                    </div>
                    {renderProductGrid(groupedData.bestsellers)}
                  </section>
                )}

                {/* Rekomendasi / Promo */}
                {groupedData.recommended.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                        <Sparkles size={20} />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Rekomendasi Untuk Anda</h2>
                    </div>
                    {renderProductGrid(groupedData.recommended)}
                  </section>
                )}

                {/* Produk Baru */}
                {groupedData.newest.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Zap size={20} />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Produk Terbaru</h2>
                    </div>
                    {renderProductGrid(groupedData.newest)}
                  </section>
                )}

                {/* Semua Produk */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Grid size={20} />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Semua Produk</h2>
                    </div>
                  </div>
                  {renderProductGrid(products)}
                </section>
              </div>
            ) : (
              /* Search/Filter Mode: Just show the grid */
              <div className="animate-in fade-in duration-500">
                {renderProductGrid(products)}
              </div>
            )}
          </>
        )}

        {/* Load More Button */}
        {currentPage < totalPages && (
          <div className="mt-12 flex justify-center pb-8">
            <button 
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-8 py-3.5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-violet-500/30 text-foreground font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {isLoadingMore && <Loader2 size={16} className="animate-spin" />}
              {isLoadingMore ? "Memuat Data..." : "Muat Lebih Banyak Produk"}
            </button>
          </div>
        )}

        <QuickPreviewModal 
          isOpen={!!previewProduct}
          onClose={() => setPreviewProduct(null)}
          product={previewProduct}
        />
      </div>
    </div>
  );
}
