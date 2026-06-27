import { TicketManager } from "@/components/sections/ticket-manager";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Layanan Tiket & Garansi - JStore Admin",
};

export default function AdminTicketsPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Pusat Bantuan & Tiket</h1>
          <p className="text-xs text-muted-foreground mt-1">Selesaikan komplain pelanggan dan proses ganti akun otomatis (Klaim Garansi).</p>
        </div>
      </div>

      <TicketManager />
    </div>
  );
}
