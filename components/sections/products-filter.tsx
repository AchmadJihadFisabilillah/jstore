"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, Laptop, Sparkles, Video, Headphones, LayoutGrid } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ProductLogo } from "@/components/admin";

type Package = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  packages: Package[];
};

type ProductsFilterProps = {
  products: Product[];
};

const CATEGORIES = [
  { id: "all", label: "Semua", icon: LayoutGrid },
  { id: "Streaming", label: "Streaming", icon: Tv },
  { id: "Productivity", label: "Productivity", icon: Laptop },
  { id: "AI", label: "AI", icon: Sparkles },
  { id: "Editing", label: "Editing", icon: Video },
  { id: "Music", label: "Music", icon: Headphones },
];

export function ProductsFilter({ products }: ProductsFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="w-full space-y-12">
      {/* Category Tabs with macOS Dock Hover Effect */}
      <div className="blocks-container">
        <ul className="blocks">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <li
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`block ${isActive ? "is-active" : ""}`}
              >
                <div className="block__item">
                  {/* Top border active glow */}
                  {isActive && (
                    <div className="block-active-glow" />
                  )}

                  <Icon
                    size={26}
                    className={`transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-[11px] font-semibold tracking-wide uppercase select-none">{cat.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const minPrice = product.packages.length > 0 
              ? Math.min(...product.packages.map((pack) => pack.price)) 
              : 0;

            return (
              <motion.article
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3 }}
                className="card-jstore card-hover p-6 flex flex-col justify-between relative overflow-hidden border border-border bg-card backdrop-blur-md group"
              >
                {/* Glow radial overlay */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.06)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <ProductLogo name={product.name} size="md" />
                    <span className="text-[10px] font-extrabold tracking-widest text-primary uppercase bg-violet-400/10 px-2.5 py-1 rounded-full border border-violet-400/20">
                      {product.category}
                    </span>
                  </div>
                  
                  <h3 className="mt-4 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground">Mulai dari</span>
                    <span className="text-lg font-extrabold text-foreground">
                      {formatRupiah(minPrice)}
                    </span>
                  </div>
                  
                  <Link
                    href={`/produk/${product.id}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-muted border border-border hover:bg-gradient-to-r hover:from-violet-600 hover:to-fuchsia-600 hover:border-transparent py-3 text-sm font-semibold text-foreground shadow-sm hover:shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
