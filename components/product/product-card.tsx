"use client";

import Link from "next/link";
import { Clock, ShieldCheck, Zap } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ProductLogo } from "@/components/admin";
import { WishlistButton } from "@/components/shared/wishlist-button";

export interface ProductCardProps {
  product: any; // We'll refine type later
  onQuickPreview?: () => void;
}

export function ProductCard({ product, onQuickPreview }: ProductCardProps) {
  // Aggregate package stats
  const packages = product.packages || [];
  const activePackages = packages.filter((p: any) => p.isActive);
  
  const minPrice = activePackages.length > 0 
    ? Math.min(...activePackages.map((p: any) => p.price)) 
    : 0;
    
  const hasDiscount = activePackages.some((p: any) => p.discount > 0);
  const maxDiscount = hasDiscount 
    ? Math.max(...activePackages.map((p: any) => p.discount)) 
    : 0;

  // Stock status logic
  // Simplified logic for frontend card representation
  const isOutOfStock = activePackages.length > 0 && activePackages.every((p: any) => p.stockStatus === "Habis");
  const isLowStock = activePackages.some((p: any) => p.stockStatus === "Stok Menipis");
  
  const stockText = isOutOfStock ? "Stok Habis" : isLowStock ? "Stok Menipis" : "Tersedia";
  const stockColor = isOutOfStock ? "text-red-400 bg-red-400/10" : isLowStock ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10";
  const dotColor = isOutOfStock ? "bg-red-400" : isLowStock ? "bg-amber-400" : "bg-emerald-400";

  // Badges
  const badges = [];
  if (product.isBestseller) badges.push({ text: "Terlaris", color: "bg-fuchsia-600 text-foreground" });
  if (product.isNew) badges.push({ text: "Baru", color: "bg-blue-600 text-foreground" });
  if (hasDiscount) badges.push({ text: `Hemat ${maxDiscount}%`, color: "bg-rose-600 text-foreground" });

  const displayBadges = badges.slice(0, 2); // Max 2 badges

  // Get popular duration from packages if any
  const popularDuration = activePackages.length > 0 
    ? activePackages.sort((a: any, b: any) => (b.order || 0) - (a.order || 0))[0].duration
    : null;

  return (
    <article className="card-jstore p-4 flex flex-col justify-between relative overflow-hidden border border-border bg-card hover:bg-muted dark:bg-[#12121A] dark:hover:bg-[#161622] rounded-2xl group hover:border-violet-500/40 transition-all duration-300 h-full shadow-lg">
      {/* Background Brand Glow */}
      <div 
        className="absolute -top-10 -right-10 h-32 w-32 -z-10 rounded-full blur-[50px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" 
        style={{ backgroundColor: product.brandColor || "#8B5CF6" }} 
      />

      {/* Top Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <ProductLogo 
              name={product.name} 
              logoUrl={product.logoUrl} 
              size="md" 
            />
            {displayBadges.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {displayBadges.map((b, i) => (
                  <span key={i} className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${b.color}`}>
                    {b.text}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="bg-background/40 p-1.5 rounded-full border border-border backdrop-blur-md relative z-10 transition-colors group-hover:border-violet-500/30">
            <WishlistButton productId={product.id} />
          </div>
        </div>
        
        <div className="mt-1">
          <Link href={`/produk/${product.id}`} className="block group-hover:text-violet-400 transition-colors">
            <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
            {product.category}
          </p>
        </div>

        {/* Small Details - Max 3 Items */}
        <div className="mt-1 space-y-1.5 text-[11px] text-muted-foreground font-medium">
          {popularDuration && (
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-violet-400 opacity-80" />
              <span>{popularDuration} Hari / Bulan</span>
            </div>
          )}
          {product.processingType && (
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-amber-400 opacity-80" />
              <span className="line-clamp-1">{product.processingType}</span>
            </div>
          )}
          {product.warrantyDuration && (
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-400 opacity-80" />
              <span className="line-clamp-1">Garansi {product.warrantyDuration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-4">
        {/* Price & Stock - Stacked to prevent collision */}
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Mulai dari</p>
            <p className="text-[17px] font-black text-foreground leading-none">
              {formatRupiah(minPrice)}
            </p>
          </div>
          <div className="flex items-center">
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 ${stockColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${!isOutOfStock && 'animate-pulse'}`}></span>
              {stockText}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {onQuickPreview && (
            <button 
              onClick={(e) => { e.preventDefault(); onQuickPreview(); }}
              className="w-full py-2.5 rounded-xl border border-border hover:border-violet-500/50 hover:bg-violet-500/10 text-xs font-semibold text-foreground transition-all active:scale-[0.98]"
            >
              Lihat Paket
            </button>
          )}
          <Link
            href={`/produk/${product.id}`}
            className={`w-full py-2.5 flex items-center justify-center rounded-xl text-xs font-bold text-foreground transition-all active:scale-[0.98] ${isOutOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' : 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'}`}
            onClick={(e) => isOutOfStock && e.preventDefault()}
          >
            {isOutOfStock ? "Habis" : "Beli Sekarang"}
          </Link>
        </div>
      </div>
    </article>
  );
}
