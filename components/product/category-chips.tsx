"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { LayoutGrid, Tv, Laptop, Sparkles, Video, Headphones, Gamepad2, Cloud, FileText } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "Semua", icon: LayoutGrid },
  { id: "Streaming", label: "Streaming", icon: Tv },
  { id: "AI Tools", label: "AI Tools", icon: Sparkles },
  { id: "Editing dan Desain", label: "Editing", icon: Video },
  { id: "Musik", label: "Musik", icon: Headphones },
  { id: "Produktivitas", label: "Productivity", icon: Laptop },
  { id: "Game dan Top Up", label: "Gaming", icon: Gamepad2 },
  { id: "Cloud Storage", label: "Storage", icon: Cloud },
  { id: "Lainnya", label: "Lainnya", icon: FileText },
];

export function CategoryChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "all";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      // Reset page when category changes
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-4 pt-2">
      <div className="flex gap-3 px-1 w-max">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = currentCategory.toLowerCase() === cat.id.toLowerCase();

          return (
              <button
                key={cat.id}
                onClick={() => {
                  router.push(pathname + "?" + createQueryString("category", cat.id), { scroll: false });
                }}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1.5 md:gap-2 px-4 py-3 md:py-2.5 rounded-2xl md:rounded-full border transition-all active:scale-95 ${
                  isActive 
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent shadow-[0_0_20px_rgba(139,92,246,0.3)] text-white font-bold" 
                  : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:bg-card hover:border-violet-500/30 font-medium"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : ""} />
                <span className="text-[11px] md:text-sm whitespace-nowrap">{cat.label}</span>
              </button>
          );
        })}
      </div>
    </div>
  );
}
