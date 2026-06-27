"use client";

import { X, CheckCircle, ShieldCheck, Zap } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ProductLogo } from "@/components/admin";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickPreviewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickPreviewModal({ product, isOpen, onClose }: QuickPreviewModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isMounted) return null;

  const packages = product?.packages?.filter((p: any) => p.isActive) || [];

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 dark:bg-[#0A0A0F]/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-xl bg-card dark:bg-[#12121A] sm:rounded-3xl rounded-t-3xl border border-border overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex gap-4 relative bg-muted/50 dark:bg-[#161622]/50" >
              {/* Brand Glow */}
              <div 
                className="absolute top-0 right-0 h-32 w-32 -z-10 rounded-full blur-[60px] opacity-20 pointer-events-none" 
                style={{ backgroundColor: product.brandColor || "#8B5CF6" }} 
              />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-card border border-border hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
              
              <ProductLogo name={product.name} logoUrl={product.logoUrl} size="lg" />
              <div className="pr-8">
                <h2 className="text-xl sm:text-2xl font-black text-foreground">{product.name}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2">{product.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-4 text-[11px] sm:text-xs text-muted-foreground font-medium">
                  {product.processingType && (
                    <div className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-md border border-border/50">
                      {product.processingType.includes("Instan") ? <Zap size={14} className="text-amber-400" /> : <ShieldCheck size={14} className="text-emerald-400" />}
                      {product.processingType}
                    </div>
                  )}
                  {product.warrantyDuration && (
                    <div className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-md border border-border/50">
                      <ShieldCheck size={14} className="text-blue-400" />
                      Garansi {product.warrantyDuration}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-background/20">
              <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center justify-between">
                <span>Pilihan Paket ({packages.length})</span>
              </h3>
              
              <div className="space-y-3">
                {packages.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-6 bg-card/30 rounded-xl border border-dashed border-border">Belum ada paket tersedia.</p>
                )}
                
                {packages.map((pkg: any) => {
                  const isOutOfStock = pkg.stockStatus === "Habis";
                  
                  return (
                    <div key={pkg.id} className={`p-4 rounded-xl border transition-colors ${isOutOfStock ? 'border-red-500/20 bg-red-500/5' : 'border-border bg-card/50 hover:bg-card hover:border-violet-500/30'} flex justify-between items-center group`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground text-sm group-hover:text-violet-400 transition-colors">{pkg.name}</h4>
                          {pkg.discount > 0 && (
                            <span className="text-[10px] bg-gradient-to-r from-rose-500 to-rose-600 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">-{pkg.discount}%</span>
                          )}
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1"><Zap size={12} className="opacity-70" /> {pkg.duration} Hari</span>
                          {pkg.warranty && <span className="flex items-center gap-1"><ShieldCheck size={12} className="opacity-70" /> {pkg.warranty}</span>}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {pkg.discount > 0 && pkg.originalPrice && (
                          <p className="text-[10px] text-muted-foreground line-through mb-0.5">{formatRupiah(pkg.originalPrice)}</p>
                        )}
                        <p className="font-black text-foreground text-base">{formatRupiah(pkg.price)}</p>
                        <p className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${isOutOfStock ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isOutOfStock ? "Stok Habis" : "Tersedia"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-card/80 dark:bg-[#161622]/80 border-t border-border flex gap-3 sm:gap-4 backdrop-blur-md">
              <button 
                onClick={onClose}
                className="w-1/3 py-3 sm:py-3.5 rounded-xl border border-border bg-card hover:bg-white/5 font-bold text-foreground transition-all text-xs sm:text-sm"
              >
                Tutup
              </button>
              <Link 
                href={`/produk/${product.id}`}
                className="w-2/3 py-3 sm:py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-white transition-all text-xs sm:text-sm flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
              >
                Lihat Detail Penuh
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
