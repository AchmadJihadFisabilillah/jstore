"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ExternalLink, ChevronRight, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse path to breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      let label = seg.charAt(0).toUpperCase() + seg.slice(1);
      
      // Custom mapping for prettier Indonesian names
      if (seg === "admin") label = "Dashboard";
      else if (seg === "kategori") label = "Kategori";
      else if (seg === "produk") label = "Produk & Varian";
      else if (seg === "stok") label = "Stok Digital";
      else if (seg === "pesanan") label = "Pesanan";
      else if (seg === "pembayaran") label = "Verifikasi Pembayaran";
      else if (seg === "pelanggan") label = "Pelanggan";
      else if (seg === "promosi") label = "Promo & Voucher";
      else if (seg === "layanan") label = "Layanan Tiket";
      else if (seg === "refund") label = "Refund Uang";
      else if (seg === "laporan") label = "Laporan Keuangan";
      else if (seg === "staff") label = "Staf & Akses";
      else if (seg === "audit-logs") label = "Audit Log";
      else if (seg === "pengaturan") label = "Pengaturan";

      return { label, href, isLast: idx === segments.length - 1 };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const responseJson = await res.json();
        setNotifications(responseJson.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl+K to open Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMarkAsRead = async (id: string, link: string | null) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        if (link) {
          setIsOpen(false);
          router.push(link);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-14 lg:h-16 border-b border-border bg-gradient-to-r from-[#07070a] to-[#08080c] px-4 lg:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left section: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"))}
          className="lg:hidden p-1.5 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground transition-colors duration-200">
            Admin
          </Link>
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <ChevronRight size={11} className="text-zinc-700" />
            <Link
              href={crumb.href}
              className={cn(
                crumb.isLast ? "text-primary font-semibold pointer-events-none" : "hover:text-foreground transition-colors duration-200"
              )}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
        </nav>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted border border-border hover:border-border hover:bg-muted hover:text-foreground px-3 py-1.5 rounded-lg transition-all duration-200"
        >
          <Search size={14} />
          <span>Cari (Ctrl+K)</span>
        </button>

        {/* View Main Site */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-all duration-200 bg-muted border border-border px-3 py-1.5 rounded-lg hover:border-border hover:bg-muted"
        >
          Lihat Toko <ExternalLink size={11} />
        </Link>
        <ThemeToggle />

        {/* Notifications Center */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border transition-all duration-200 cursor-pointer"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-500 text-[10px] text-foreground font-extrabold flex items-center justify-center rounded-full border-2 border-[#07070a] shadow-lg shadow-rose-500/20">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-border bg-[#0a0a10]/98 backdrop-blur-xl shadow-2xl shadow-black/40 p-2 z-50" style={{ animation: 'adminFadeIn 0.2s ease, adminSlideIn 0.15s ease' }}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-bold text-foreground">Notifikasi Admin</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] text-primary hover:text-primary font-semibold cursor-pointer"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto mt-1 space-y-1 custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">Tidak ada notifikasi baru.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.link)}
                      className={cn(
                        "p-2.5 rounded-lg transition text-left cursor-pointer border flex flex-col gap-0.5",
                        n.isRead
                          ? "bg-transparent border-transparent hover:bg-muted text-muted-foreground"
                          : "bg-violet-600/5 hover:bg-violet-600/10 border-violet-500/10 text-foreground font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{n.title}</span>
                        {!n.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">{n.message}</p>
                      <span className="text-[9px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: localeId })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminCommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
