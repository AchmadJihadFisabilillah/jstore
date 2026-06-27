import { RefundsManager } from "@/components/sections/refunds-manager";
import { Undo2 } from "lucide-react";

export const metadata = {
  title: "Kelola Refund Uang - JStore Admin",
};

export default function AdminRefundsPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Undo2 size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Refund Uang</h1>
          <p className="text-xs text-muted-foreground mt-1">Audit pengajuan refund saldo / uang dari pembeli akibat akun bermasalah dan proses pengembalian dana.</p>
        </div>
      </div>

      <RefundsManager />
    </div>
  );
}
