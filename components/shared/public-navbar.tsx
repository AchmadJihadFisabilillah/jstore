"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Search, User, ShoppingBag, Hexagon, X, Loader2, 
  Menu, Home, Package, Key, ChevronRight 
} from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { useDebounce } from "../../hooks/use-debounce";
import { ProductLogo } from "@/components/admin/ProductLogo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const NAV_LINKS = [
  { label: "Produk", href: "/produk" },
  { label: "Fitur", href: "/fitur" },
  { label: "Testimoni", href: "/testimoni" },
  { label: "FAQ", href: "/faq" },
];

const BOTTOM_TABS = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Produk", href: "/produk", icon: ShoppingBag },
  { label: "Pesanan", href: "/dashboard/pesanan", icon: Package },
  { label: "Langganan", href: "/dashboard/langganan", icon: Key },
  { label: "Akun", href: "/dashboard", icon: User, authFallback: "/login" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
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
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const isTabActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ===================== TOP HEADER ===================== */}
      <header className="sticky top-0 z-40 border-b border-border bg-background backdrop-blur-md">
        <div className="container-jstore flex h-14 md:h-20 items-center justify-between">
          {/* Left: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target cursor-pointer"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-transform duration-300 group-hover:scale-105">
                <Hexagon size={16} className="md:hidden text-foreground fill-white/10" />
                <Hexagon size={20} className="hidden md:block text-foreground fill-white/10" />
              </div>
              <span className="text-lg md:text-xl font-bold tracking-wider text-foreground">
                J<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-extrabold">STORE</span>
              </span>
            </Link>
          </div>

          {/* Center Nav Links (Desktop only) */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors duration-200 relative py-1",
                  pathname === item.href && "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-violet-500 after:to-fuchsia-500"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons & CTA */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted cursor-pointer touch-target"
              aria-label="Cari produk"
            >
              <Search size={18} />
            </button>
            <ThemeToggle />
            
            {/* Desktop-only icons */}
            <Link
              href={session ? "/dashboard" : "/login"}
              className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
              title={session ? "Dashboard Saya" : "Masuk"}
            >
              <User size={18} />
            </Link>

            <Link
              href="/produk"
              className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted relative"
            >
              <ShoppingBag size={18} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            </Link>

            {/* CTA Button (Desktop) */}
            {!session ? (
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-foreground shadow-[0_4px_20px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.4)] transition-all duration-300 active:scale-[0.98]"
              >
                Daftar Sekarang
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center justify-center rounded-xl bg-muted border border-border hover:bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 active:scale-[0.98]"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ===================== MOBILE DRAWER ===================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer panel */}
          <aside 
            className="absolute top-0 left-0 h-full w-[280px] max-w-[85vw] bg-[#08080c] border-r border-border flex flex-col overflow-hidden"
            style={{ animation: "adminSlideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                  <Hexagon size={16} className="text-foreground fill-white/10" />
                </div>
                <span className="text-lg font-bold tracking-wider text-foreground">
                  J<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-extrabold">STORE</span>
                </span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-1">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all touch-target",
                      pathname === item.href
                        ? "bg-violet-500/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                    <ChevronRight size={16} className="text-zinc-600" />
                  </Link>
                ))}
              </div>

              <div className="my-4 h-px bg-muted" />

              {/* Auth Links */}
              <div className="space-y-1">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all touch-target"
                    >
                      <User size={18} />
                      Dashboard Saya
                    </Link>
                    <Link
                      href="/dashboard/pesanan"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all touch-target"
                    >
                      <Package size={18} />
                      Pesanan Saya
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all touch-target"
                    >
                      <User size={18} />
                      Masuk
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-border shrink-0" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
              {!session ? (
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-foreground shadow-[0_4px_20px_rgba(139,92,246,0.25)]"
                >
                  Daftar Sekarang
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-muted border border-border py-3 text-sm font-semibold text-foreground"
                >
                  Buka Dashboard
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ===================== SEARCH OVERLAY ===================== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 md:pt-24 px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
          
          <div 
            ref={searchRef}
            className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
          >
            <div className="flex items-center px-4 border-b border-border">
              <Search size={20} className="text-muted-foreground mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent h-14 md:h-16 text-foreground placeholder:text-muted-foreground outline-none text-base md:text-lg"
                placeholder="Cari produk (contoh: Netflix, Spotify)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && <Loader2 size={18} className="animate-spin text-primary mr-3" />}
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted rounded-lg transition cursor-pointer"
                aria-label="Tutup pencarian"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {query.length > 0 && query.length < 2 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Ketik setidaknya 2 karakter untuk mencari...
                </div>
              )}

              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
                  <Search size={32} className="text-zinc-600 mb-4" />
                  <p className="text-foreground font-medium">Produk tidak ditemukan</p>
                  <p className="text-muted-foreground text-sm mt-1">Coba kata kunci lain atau lihat semua produk.</p>
                  <Link 
                    href="/produk" 
                    onClick={() => setIsSearchOpen(false)}
                    className="mt-4 px-4 py-2 bg-muted hover:bg-muted rounded-lg text-sm font-medium text-foreground transition"
                  >
                    Lihat Semua Produk
                  </Link>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hasil Pencarian</div>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produk/${product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 md:gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                    >
                      <ProductLogo name={product.name} logoUrl={product.logoUrl} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {product.name}
                          </h4>
                          <span className="text-xs font-bold text-foreground shrink-0">
                            Mulai {product.packages[0] ? formatRupiah(product.packages[0].price) : '-'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{product.shortDesc || product.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== BOTTOM NAVIGATION (Mobile) ===================== */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-[60px]">
          {BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const href = tab.authFallback && !session ? tab.authFallback : tab.href;
            const active = isTabActive(tab.href);
            
            return (
              <Link
                key={tab.label}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
                )}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className={cn("text-[10px] font-medium", active && "font-bold")}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
