"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role } from "@/lib/constants/roles";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderTree,
  ShoppingBag,
  Key,
  Receipt,
  CreditCard,
  Users,
  Ticket,
  Percent,
  Undo2,
  TrendingUp,
  UserCheck,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
    permissions: string[];
  };
}

// Definisikan struktur menu dengan grouping
type MenuItem = {
  title: string;
  href: string;
  icon: any;
  show: boolean;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
  show: boolean;
};

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Initialize from localStorage on mount and listen to custom events
  useEffect(() => {
    const savedCollapse = localStorage.getItem("jstore_admin_sidebar_collapsed");
    if (savedCollapse === "true") {
      setIsCollapsed(true);
    }

    const handleMobileToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener("toggle-mobile-sidebar", handleMobileToggle);
    return () => window.removeEventListener("toggle-mobile-sidebar", handleMobileToggle);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem("jstore_admin_sidebar_collapsed", String(newValue));
    
    // Automatically expand all groups when sidebar expands
    if (!newValue) {
      setExpandedGroups({});
    }
  };

  const toggleGroup = (groupLabel: string) => {
    if (isCollapsed) return; // Don't toggle groups when sidebar is collapsed
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-muted-foreground border-zinc-500/20";
    }
  };

  const formatRoleName = (role: Role) => {
    return role === Role.ADMIN ? "Administrator" : "User";
  };

  const menuGroups: MenuGroup[] = [
    {
      label: "Utama",
      show: true,
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          show: true,
        },
      ],
    },
    {
      label: "Katalog & Stok",
      show: hasPermission(user, PERMISSIONS.PRODUCTS_VIEW) || hasPermission(user, PERMISSIONS.STOCK_VIEW),
      items: [
        {
          title: "Kategori",
          href: "/admin/kategori",
          icon: FolderTree,
          show: hasPermission(user, PERMISSIONS.PRODUCTS_VIEW),
        },
        {
          title: "Produk & Varian",
          href: "/admin/produk",
          icon: ShoppingBag,
          show: hasPermission(user, PERMISSIONS.PRODUCTS_VIEW),
        },
        {
          title: "Stok Digital",
          href: "/admin/stok",
          icon: Key,
          show: hasPermission(user, PERMISSIONS.STOCK_VIEW),
        },
      ],
    },
    {
      label: "Transaksi & Tiket",
      show: hasPermission(user, PERMISSIONS.ORDERS_VIEW) || hasPermission(user, PERMISSIONS.TICKETS_MANAGE) || hasPermission(user, PERMISSIONS.PAYMENTS_VERIFY) || hasPermission(user, PERMISSIONS.REFUND_PROCESS),
      items: [
        {
          title: "Pesanan",
          href: "/admin/pesanan",
          icon: Receipt,
          show: hasPermission(user, PERMISSIONS.ORDERS_VIEW),
        },
        {
          title: "Langganan (Subs)",
          href: "/admin/langganan",
          icon: require("lucide-react").Repeat,
          show: hasPermission(user, PERMISSIONS.ORDERS_VIEW),
        },
        {
          title: "Verifikasi Transfer",
          href: "/admin/pembayaran",
          icon: CreditCard,
          show: hasPermission(user, PERMISSIONS.PAYMENTS_VERIFY),
        },
        {
          title: "Layanan Tiket",
          href: "/admin/layanan",
          icon: Ticket,
          show: hasPermission(user, PERMISSIONS.TICKETS_MANAGE),
        },
        {
          title: "Refund Uang",
          href: "/admin/refund",
          icon: Undo2,
          show: hasPermission(user, PERMISSIONS.REFUND_PROCESS),
        },
      ],
    },
    {
      label: "Data & Operasional",
      show: hasPermission(user, PERMISSIONS.CUSTOMERS_VIEW) || hasPermission(user, PERMISSIONS.SETTINGS_UPDATE) || hasPermission(user, PERMISSIONS.REPORTS_VIEW),
      items: [
        {
          title: "Supplier Produk",
          href: "/admin/supplier",
          icon: require("lucide-react").Truck,
          show: hasPermission(user, PERMISSIONS.STOCK_VIEW),
        },
        {
          title: "Pelanggan",
          href: "/admin/pelanggan",
          icon: Users,
          show: hasPermission(user, PERMISSIONS.CUSTOMERS_VIEW),
        },
        {
          title: "Kupon & Voucher",
          href: "/admin/promosi",
          icon: Percent,
          show: hasPermission(user, PERMISSIONS.SETTINGS_UPDATE),
        },
        {
          title: "Laporan Keuangan",
          href: "/admin/laporan",
          icon: TrendingUp,
          show: hasPermission(user, PERMISSIONS.REPORTS_VIEW),
        },
      ],
    },
    {
      label: "Sistem & Akses",
      show: hasPermission(user, PERMISSIONS.ADMINS_MANAGE) || hasPermission(user, PERMISSIONS.AUDIT_LOGS_VIEW) || hasPermission(user, PERMISSIONS.SETTINGS_UPDATE),
      items: [
        {
          title: "Pengaturan Staf",
          href: "/admin/staff",
          icon: UserCheck,
          show: hasPermission(user, PERMISSIONS.ADMINS_MANAGE),
        },
        {
          title: "Audit Log Aktif",
          href: "/admin/audit-logs",
          icon: History,
          show: hasPermission(user, PERMISSIONS.AUDIT_LOGS_VIEW),
        },
        {
          title: "Pengaturan Utama",
          href: "/admin/pengaturan",
          icon: Settings,
          show: hasPermission(user, PERMISSIONS.SETTINGS_UPDATE),
        },
        {
          title: "Pengaturan QRIS",
          href: "/admin/settings/qris",
          icon: require("lucide-react").QrCode,
          show: hasPermission(user, PERMISSIONS.SETTINGS_UPDATE),
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen bg-gradient-to-b from-[#07070a] to-[#060609] border-r border-border flex flex-col justify-between transition-all duration-300 ease-out lg:relative lg:translate-x-0 shrink-0",
          isMobileOpen ? "w-[280px] max-w-[85vw]" : (isCollapsed ? "w-[72px]" : "w-64"),
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
      <div className="flex flex-col overflow-hidden h-full">
        {/* Sidebar Header */}
        <div className="h-14 lg:h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden select-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/20 text-primary shadow-lg shadow-violet-500/5 shrink-0">
              <ShieldCheck size={20} />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-extrabold text-foreground text-base tracking-tight truncate">
                JStore <span className="text-primary text-[10px] font-bold ml-0.5 uppercase tracking-widest">Admin</span>
              </span>
            )}
          </Link>
          {/* Desktop: collapse toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shrink-0"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          {/* Mobile: close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Tutup sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Staff Profile Card Summary */}
        <div className={cn("p-4 border-b border-border flex items-center gap-3 overflow-hidden shrink-0", isCollapsed && "justify-center")}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-foreground font-bold shrink-0 shadow-lg shadow-violet-500/15 ring-2 ring-violet-500/10">
            {user.name ? user.name[0].toUpperCase() : "A"}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate leading-none mb-1.5">{user.name}</p>
              <span className={cn("inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide", getRoleBadgeColor(user.role))}>
                {formatRoleName(user.role)}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {menuGroups
            .filter((group) => group.show)
            .map((group, gIdx) => {
              const visibleItems = group.items.filter((item) => item.show);
              if (visibleItems.length === 0) return null;
              
              const isGroupCollapsed = expandedGroups[group.label] && !isCollapsed;

              return (
                <div key={group.label} className="flex flex-col gap-1">
                  {/* Group Header */}
                  {!isCollapsed && (
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 hover:text-muted-foreground transition-colors cursor-pointer w-full text-left"
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        size={12}
                        className={cn("transition-transform duration-200", isGroupCollapsed && "-rotate-90")}
                      />
                    </button>
                  )}
                  {isCollapsed && gIdx > 0 && <div className="h-px bg-white/[0.04] mx-2 my-2" />}

                  {/* Group Items */}
                  <div
                    className={cn(
                      "flex flex-col gap-0.5 overflow-hidden transition-all duration-300",
                      isGroupCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
                    )}
                  >
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                            isActive
                              ? "bg-violet-600/12 border border-violet-500/15 text-primary shadow-sm shadow-violet-500/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent"
                          )}
                          title={isCollapsed ? item.title : undefined}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-violet-500 rounded-r-full" />
                          )}
                          <Icon
                            size={18}
                            className={cn(
                              "shrink-0 transition-all duration-200",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-muted-foreground"
                            )}
                          />
                          {!isCollapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-border shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 border border-transparent hover:border-rose-500/10 transition-all duration-200 cursor-pointer group",
            isCollapsed && "justify-center"
          )}
          title="Keluar"
        >
          <LogOut size={18} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          {!isCollapsed && <span className="truncate">Keluar Sesi</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
