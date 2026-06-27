"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X, CheckCircle, SlidersHorizontal, ChevronDown } from "lucide-react";

interface FilterToolbarProps {
  totalProducts: number;
}

export function FilterToolbar({ totalProducts }: FilterToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const toggleFilter = (name: string, value: string) => {
    const current = searchParams.get(name);
    if (current === value) {
      router.push(pathname + "?" + createQueryString(name, ""), { scroll: false });
    } else {
      router.push(pathname + "?" + createQueryString(name, value), { scroll: false });
    }
  };

  const removeFilter = (name: string) => {
    router.push(pathname + "?" + createQueryString(name, ""), { scroll: false });
  };

  const currentSort = searchParams.get("sortBy") || "popular";
  
  const sortOptions = [
    { id: "popular", label: "Terpopuler" },
    { id: "newest", label: "Terbaru" },
    { id: "price_asc", label: "Harga Terendah" },
    { id: "price_desc", label: "Harga Tertinggi" },
    { id: "discount", label: "Diskon Terbesar" }
  ];

  const currentSortLabel = sortOptions.find(s => s.id === currentSort)?.label || "Terpopuler";

  // Prevent hydration mismatch
  if (!mounted) return null;

  // Active filters for chips
  const activeFilters = [];
  const stock = searchParams.get("stockStatus");
  if (stock) activeFilters.push({ name: "stockStatus", label: stock });
  
  const process = searchParams.get("activationType");
  if (process) activeFilters.push({ name: "activationType", label: process });
  
  const isSearchActive = searchParams.has("q") || activeFilters.length > 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-card/50 p-3 rounded-2xl border border-border">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Menampilkan <strong className="text-foreground">{totalProducts}</strong> produk</span>
          {activeFilters.length > 0 && (
            <div className="hidden md:flex flex-wrap gap-2 ml-4">
              {activeFilters.map(filter => (
                <span key={filter.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-bold">
                  {filter.label}
                  <button onClick={() => removeFilter(filter.name)} className="hover:text-foreground">
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button 
                onClick={() => router.push(pathname, { scroll: false })}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 ml-1"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filter Button */}
          <button 
            onClick={() => setIsOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground hover:border-violet-500/50 hover:bg-violet-500/5 transition-all"
          >
            <SlidersHorizontal size={16} />
            Filter
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-violet-600 text-[10px] flex items-center justify-center text-white">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full flex items-center justify-between gap-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground hover:border-violet-500/50 transition-all"
            >
              <span className="truncate">{currentSortLabel}</span>
              <ChevronDown size={16} className={`transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-20 py-2 overflow-hidden backdrop-blur-xl">
                {sortOptions.map(sort => (
                  <button
                    key={sort.id}
                    onClick={() => {
                      toggleFilter("sortBy", sort.id);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${currentSort === sort.id ? 'bg-violet-500/10 text-violet-400 font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Drawer / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          
          <div className="relative h-full w-full max-w-sm bg-card border-l border-border p-6 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Filter size={20} className="text-violet-400" /> Filter Produk
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Status Stok */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Status Stok</h3>
                <div className="space-y-3">
                  {[
                    { id: "Tersedia", label: "Tersedia" },
                    { id: "Habis", label: "Habis" },
                    { id: "Stok Menipis", label: "Stok Menipis" }
                  ].map(stock => {
                    const isActive = searchParams.get("stockStatus") === stock.id;
                    return (
                      <button
                        key={stock.id}
                        onClick={() => toggleFilter("stockStatus", stock.id)}
                        className="flex items-center gap-3 w-full group"
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-violet-600 border-violet-500' : 'border-border group-hover:border-violet-500/50'}`}>
                          {isActive && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                          {stock.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipe Proses */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Tipe Proses</h3>
                <div className="space-y-3">
                  {["Otomatis", "Manual", "Butuh Data User", "Invite Email"].map(type => {
                    const isActive = searchParams.get("activationType") === type;
                    return (
                      <button
                        key={type}
                        onClick={() => toggleFilter("activationType", type)}
                        className="flex items-center gap-3 w-full group"
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-violet-600 border-violet-500' : 'border-border group-hover:border-violet-500/50'}`}>
                          {isActive && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                          {type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-border/50 flex gap-3">
              {(searchParams.toString() !== "" && searchParams.toString() !== "sortBy=popular") && (
                <button
                  onClick={() => {
                    router.push(pathname, { scroll: false });
                    setIsOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl border border-rose-500/30 text-rose-400 font-bold text-sm hover:bg-rose-500/10 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex-[2] py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-colors shadow-lg shadow-violet-600/20"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
