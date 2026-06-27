"use client";

import { Menu, Bell, User as UserIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Header({ 
  user,
  setSidebarOpen 
}: { 
  user: { name: string; email: string };
  setSidebarOpen: (isOpen: boolean) => void;
}) {
  const pathname = usePathname();
  const [greeting, setGreeting] = useState("Selamat datang");
  
  // Create breadcrumbs based on pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p !== '');
    if (paths.length === 1 && paths[0] === 'dashboard') {
      return [{ name: "Dashboard", href: "/dashboard" }];
    }
    
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      return {
        name: path.charAt(0).toUpperCase() + path.slice(1),
        href
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Selamat pagi");
    else if (hour >= 12 && hour < 15) setGreeting("Selamat siang");
    else if (hour >= 15 && hour < 18) setGreeting("Selamat sore");
    else setGreeting("Selamat malam");
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 lg:h-20 w-full items-center justify-between border-b border-border bg-card px-4 lg:px-6 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Breadcrumbs for Desktop */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              <Link 
                href={crumb.href}
                className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : "hover:text-foreground transition-colors"}
              >
                {crumb.name}
              </Link>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Button */}
        <Link 
          href="/dashboard/notifikasi"
          className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell size={20} />
          {/* Badge Unread (Dummy for now, will connect to API later) */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-[#0d0d12]"></span>
        </Link>

        {/* Profile Dropdown Trigger */}
        <Link href="/dashboard/profil" className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-muted transition-colors border border-transparent hover:border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold text-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
