import { PromosManager } from "@/components/sections/promos-manager";
import { Percent } from "lucide-react";

export const metadata = {
  title: "Kelola Kupon & Voucher - JStore Admin",
};

export default function AdminPromosPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Percent size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Kupon & Voucher</h1>
          <p className="text-xs text-muted-foreground mt-1">Buat, edit, dan pantau penggunaan voucher potongan harga belanja produk premium.</p>
        </div>
      </div>

      <PromosManager />
    </div>
  );
}
