import { OrdersManager } from "@/components/sections/orders-manager";
import { Receipt } from "lucide-react";

export const metadata = {
  title: "Kelola Pesanan - JStore Admin",
};

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Receipt size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Pesanan</h1>
          <p className="text-xs text-muted-foreground mt-1">Pantau dan audit seluruh pesanan masuk, log status bayar, verifikasi transfer, dan alokasikan stok digital.</p>
        </div>
      </div>

      <OrdersManager />
    </div>
  );
}
