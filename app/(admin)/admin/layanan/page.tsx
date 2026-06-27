import { TicketsManager } from "@/components/sections/tickets-manager";
import { Ticket } from "lucide-react";

export const metadata = {
  title: "Layanan Tiket Komplain - JStore Admin",
};

export default function AdminTicketsPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Ticket size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Layanan Tiket Komplain</h1>
          <p className="text-xs text-muted-foreground mt-1">Interaksi percakapan dengan pembeli yang melaporkan masalah garansi atau komplain akun digital.</p>
        </div>
      </div>

      <TicketsManager />
    </div>
  );
}
