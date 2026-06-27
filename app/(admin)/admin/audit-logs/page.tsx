import { AuditLogsManager } from "@/components/sections/audit-logs-manager";
import { History } from "lucide-react";

export const metadata = {
  title: "Audit Log Aktif - JStore Admin",
};

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <History size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Audit Log Aktif</h1>
          <p className="text-xs text-muted-foreground mt-1">Timeline jejak rekam aktivitas administratif seluruh staf panel keamanan platform.</p>
        </div>
      </div>

      <AuditLogsManager />
    </div>
  );
}
