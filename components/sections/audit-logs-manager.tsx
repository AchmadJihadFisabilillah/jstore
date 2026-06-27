"use client";

import { useEffect, useState } from "react";
import { History, Search, Loader2, Shield, Calendar } from "lucide-react";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function AuditLogsManager() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="flex admin-card p-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari Staf, Aksi, Modul, atau Detail Aktivitas..."
            className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat log audit...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="admin-empty-state">
            <History size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Tidak ada log aktivitas tercatat.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] admin-table">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="p-4 w-36">Waktu Kejadian</th>
                  <th className="p-4">Staf Pelaksana</th>
                  <th className="p-4">Modul</th>
                  <th className="p-4">Aksi Kegiatan</th>
                  <th className="p-4">Deskripsi Rincian</th>
                  <th className="p-4 w-28">Alamat IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted transition align-top">
                    <td className="p-4 text-muted-foreground space-y-0.5">
                      <p className="flex items-center gap-1 font-semibold">
                        <Calendar size={10} />
                        {new Date(log.createdAt).toLocaleDateString("id-ID")}
                      </p>
                      <p className="pl-3.5">
                        {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-foreground block">{log.user.name}</span>
                      <span className="text-[9px] text-muted-foreground block">{log.user.role.replace("ADMIN_", "STAFF ")}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-1.5 py-0.5 rounded border border-border bg-card font-bold text-primary text-[9px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">{log.action}</td>
                    <td className="p-4 text-muted-foreground leading-normal max-w-sm">{log.details || "-"}</td>
                    <td className="p-4 font-mono text-muted-foreground">{log.ipAddress || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
