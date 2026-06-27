import { SupplierManager } from "@/components/sections/supplier-manager";
import { Truck } from "lucide-react";

export const metadata = {
  title: "Kelola Supplier - JStore Admin",
};

export default function AdminSupplierPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Truck size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Supplier</h1>
          <p className="text-xs text-muted-foreground mt-1">Daftar pihak ketiga penyedia akun premium / lisensi JStore.</p>
        </div>
      </div>

      <SupplierManager />
    </div>
  );
}
