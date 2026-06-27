"use client";

import { Search, X, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

interface CatalogHeroProps {
  totalProducts?: number;
}

export function CatalogHero({ totalProducts = 0 }: CatalogHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 500);
  const isInitialMount = useRef(true);

  // Sync state when URL changes externally
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Update URL when debounced query changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentQ = searchParams.get("q") || "";
    if (debouncedQuery === currentQ) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset to page 1 on new search
    
    router.replace(`/produk?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, searchParams]);

  const clearSearch = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.set("page", "1");
    router.replace(`/produk?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-muted to-background dark:from-[#161622] dark:to-[#0A0A0F] border border-border mt-6 mb-8 flex flex-col items-center justify-center text-center px-4 md:px-8 h-[240px] md:h-[320px]">
      {/* Background Abstract Glow */}
      <div className="absolute top-0 right-1/4 -z-10 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-[100px] pointer-events-none" />

      {/* Decorative Logos (Abstract representation using CSS shapes or blurred icons if needed) */}
      <div className="absolute top-10 left-10 w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl rotate-12 blur-[2px] border border-black/10 dark:border-white/10 hidden md:block" />
      <div className="absolute bottom-10 right-12 w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full -rotate-12 blur-[3px] border border-black/10 dark:border-white/10 hidden md:block" />

      {/* Content */}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] sm:text-xs font-semibold text-emerald-400 mb-4 md:mb-6">
        <ShieldCheck size={14} />
        Produk Digital Terpercaya
      </span>
      
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-foreground">
        Temukan Aplikasi <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">Premium Favoritmu</span>
      </h1>
      
      <p className="mt-2 md:mt-4 text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
        Pilih layanan streaming, AI, editing, musik, produktivitas, dan hiburan sesuai kebutuhanmu.
      </p>

      {/* Main Search Bar */}
      <div className="mt-6 md:mt-8 w-full max-w-2xl relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-muted-foreground group-focus-within:text-violet-400 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Cari Netflix, Canva, ChatGPT, Spotify..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-background/60 backdrop-blur-md border border-border rounded-full py-3.5 md:py-4 pl-12 pr-12 text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-lg"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {totalProducts > 0 && (
        <p className="mt-4 text-[10px] md:text-xs text-muted-foreground font-medium">
          Menampilkan {totalProducts} produk pilihan
        </p>
      )}
    </div>
  );
}
