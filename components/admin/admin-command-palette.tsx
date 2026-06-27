"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Command, FileText, User, ShoppingBag, Ticket, X } from "lucide-react";
import { useDebounce } from "../../hooks/use-debounce";

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  url: string;
}

export function AdminCommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "Pesanan": return <FileText size={16} className="text-amber-400" />;
      case "Pelanggan": return <User size={16} className="text-blue-400" />;
      case "Produk": return <ShoppingBag size={16} className="text-primary" />;
      case "Tiket": return <Ticket size={16} className="text-rose-400" />;
      default: return <Command size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-border relative">
          <Search size={20} className="text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent h-14 text-foreground placeholder:text-muted-foreground outline-none text-lg"
            placeholder="Cari pesanan, pelanggan, produk, atau tiket..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 size={18} className="animate-spin text-primary absolute right-16" />}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted border border-border text-[10px] text-muted-foreground font-medium">
            ESC
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {query.length > 0 && query.length < 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Ketik setidaknya 2 karakter untuk mencari...
            </div>
          )}
          
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search size={20} className="text-zinc-600" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">Tidak ada hasil ditemukan</p>
              <p className="text-zinc-600 text-xs mt-1">Coba kata kunci lain untuk "{query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    router.push(r.url);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    {getIcon(r.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">{r.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {r.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{r.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-[#0a0a0f] border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-border bg-muted">↑</kbd><kbd className="px-1.5 py-0.5 rounded border border-border bg-muted">↓</kbd> Navigasi (Mendatang)</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-border bg-muted">Enter</kbd> Pilih</span>
          </div>
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
            JStore Global Search
          </div>
        </div>
      </div>
    </div>
  );
}
