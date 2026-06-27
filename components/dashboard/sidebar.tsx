"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Key, 
  History, 
  Ticket, 
  LifeBuoy, 
  Bell, 
  User,
  LogOut,
  X,
  Heart
} from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pesanan Saya", href: "/dashboard/pesanan", icon: Package },
  { name: "Langganan Saya", href: "/dashboard/langganan", icon: Key },
  { name: "Riwayat Transaksi", href: "/dashboard/transaksi", icon: History },
  { name: "Voucher Saya", href: "/dashboard/voucher", icon: Ticket },
  { name: "Daftar Keinginan", href: "/dashboard/wishlist", icon: Heart },
  { name: "Pusat Bantuan", href: "/dashboard/bantuan", icon: LifeBuoy },
];

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (isOpen: boolean) => void 
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform border-r border-border bg-card backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
                <span className="font-bold text-white">J</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">JSTORE</span>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* Primary Navigation */}
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Utama</p>
              
              <Link
                href="/#pricing"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ShoppingCart size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                Belanja Produk
              </Link>
              
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-violet-500/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={20} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 space-y-1">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Akun</p>
              
              <Link
                href="/dashboard/profil"
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  pathname.startsWith("/dashboard/profil") 
                    ? "bg-violet-500/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <User size={20} className={pathname.startsWith("/dashboard/profil") ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
                Profil & Keamanan
              </Link>
            </div>
          </div>
          
          <div className="border-t border-border p-4">
             {/* Instead of LogoutButton which might be a styled component from shared, we can wrap it or just use it. But user requested "Tombol Keluar jangan menjadi tombol utama yang terlalu menonjol" - wait, let's keep it minimal here or move it fully to profile dropdown. In sidebar, it can be subtle. */}
            <div className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <LogOut size={20} />
              <div className="flex-1 w-full text-left [&>form>button]:w-full [&>form>button]:text-left [&>form>button]:font-medium">
                 <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
