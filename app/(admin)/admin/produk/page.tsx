import { ProductsManager } from "@/components/sections/products-manager";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Kelola Produk & Varian - JStore Admin",
};

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <ShoppingBag size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Produk & Varian</h1>
          <p className="text-xs text-muted-foreground mt-1">Atur catalog item digital, deskripsi, badges, cara aktivasi, syarat garansi, dan SKU harga.</p>
        </div>
      </div>

      <ProductsManager />
    </div>
  );
}
