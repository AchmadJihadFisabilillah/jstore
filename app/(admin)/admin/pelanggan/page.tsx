import { CustomersManager } from "@/components/sections/customers-manager";
import { Users } from "lucide-react";

export const metadata = {
  title: "Kelola Pelanggan - JStore Admin",
};

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Pelanggan</h1>
          <p className="text-xs text-muted-foreground mt-1">Daftar pengguna terdaftar di JStore, pantau histori belanja, dan kelola status akun.</p>
        </div>
      </div>

      <CustomersManager />
    </div>
  );
}
