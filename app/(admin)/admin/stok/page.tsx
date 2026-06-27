import { StockManager } from "@/components/sections/stock-manager";
import { Key } from "lucide-react";

export const metadata = {
  title: "Kelola Persediaan Stok - JStore Admin",
};

export default function AdminStockPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Key size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Persediaan Stok</h1>
          <p className="text-xs text-muted-foreground mt-1">Kelola data login akun sharing/private, kode lisensi premium, dan link reedem secara aman.</p>
        </div>
      </div>

      <StockManager />
    </div>
  );
}
