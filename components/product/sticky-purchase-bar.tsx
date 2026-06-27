"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface StickyPurchaseBarProps {
  product: any;
  packages: any[];
}

export function StickyPurchaseBar({ product, packages }: StickyPurchaseBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when scrolled past a certain point
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible || packages.length === 0) return null;

  const selectedPkg = packages.find(p => p.id === selectedPkgId) || packages[0];

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 p-4 transform transition-transform duration-300 translate-y-0 pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-4 pointer-events-none">
      <div className="max-w-5xl mx-auto flex justify-center md:justify-end">
        <div className="bg-card backdrop-blur-xl border border-border p-3 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto max-w-full md:max-w-md w-full">
          <div className="flex-1 min-w-0">
            <select 
              className="w-full bg-muted border border-border rounded-lg text-sm text-foreground p-2 appearance-none focus:outline-none focus:border-violet-500 truncate"
              value={selectedPkg.id}
              onChange={(e) => setSelectedPkgId(e.target.value)}
            >
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id} className="bg-card">
                  {pkg.name} - {formatRupiah(pkg.price)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="shrink-0">
            <Link
              href={selectedPkg.stockStatus === "Habis" ? "#" : `/checkout/${selectedPkg.id}`}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-foreground transition-all shadow-lg ${
                selectedPkg.stockStatus === "Habis" 
                ? "bg-gray-700 cursor-not-allowed" 
                : "bg-violet-600 hover:bg-violet-500"
              }`}
            >
              <ShoppingCart size={16} />
              {selectedPkg.stockStatus === "Habis" ? "Habis" : "Beli"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
