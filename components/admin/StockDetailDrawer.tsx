"use client";

import { useState, useEffect } from "react";
import { X, Lock, History, User, FileText, AlertCircle, RefreshCw, Key, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductLogo, StatusBadge, SensitiveDataField, ConfirmDialog } from "@/components/admin";

interface AuditLog {
  id: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  reason: string | null;
  createdAt: string;
  admin?: { name: string; email: string };
  customer?: { name: string; email: string };
}

interface StockDetailDrawerProps {
  stockId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function StockDetailDrawer({ stockId, isOpen, onClose, onUpdate }: StockDetailDrawerProps) {
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Actions state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState<"reserve" | "release" | "manual" | "replace" | null>(null);
  const [reason, setReason] = useState("");
  const [orderId, setOrderId] = useState("");

  const fetchStockDetail = async () => {
    if (!stockId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stock/${stockId}`);
      if (!res.ok) throw new Error("Gagal mengambil detail stok");
      const data = await res.json();
      setStock(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stockId) {
      fetchStockDetail();
      setActionType(null);
      setReason("");
    }
  }, [isOpen, stockId]);

  const handleRevealField = async (field: string) => {
    try {
      const res = await fetch(`/api/admin/stock/${stockId}/reveal`, { method: "POST" });
      if (!res.ok) throw new Error("Gagal");
      const data = await res.json();
      return data[field] || null;
    } catch {
      return null;
    }
  };

  const handleAction = async () => {
    if (!actionType || !stockId) return;
    setActionLoading(true);
    
    let url = "";
    const body: any = { reason };

    if (actionType === "reserve") url = `/api/admin/stock/${stockId}/reserve`;
    if (actionType === "release") url = `/api/admin/stock/${stockId}/release`;
    if (actionType === "manual") {
      url = `/api/admin/stock/manual-take`;
      body.stockId = stockId;
    }
    if (actionType === "replace") {
      url = `/api/admin/stock/${stockId}/replace`;
      body.orderId = orderId;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Aksi gagal");
      
      setActionType(null);
      fetchStockDetail();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="admin-drawer-overlay">
        <div className="admin-drawer-panel w-full max-w-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border bg-card shrink-0">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Key size={18} className="text-primary" /> Detail & Riwayat Stok
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm">
                {error}
              </div>
            ) : stock ? (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                  <ProductLogo name={stock.package.product.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {stock.package.product.name}
                      </h3>
                      <StatusBadge status={stock.status} size="md" />
                    </div>
                    <p className="text-sm text-muted-foreground">{stock.package.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">ID: {stock.id}</p>
                  </div>
                </div>

                {/* Reservation Banner */}
                {stock.status === "RESERVED" && (
                  <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-400">Sedang Direservasi (Dikunci)</p>
                      <p className="text-[10px] text-amber-400/80 mt-0.5">
                        Oleh Admin ID: {stock.reservedByAdminId}
                      </p>
                      <p className="text-[10px] text-amber-400/80 mt-0.5 font-mono">
                        Berakhir: {stock.reservationExpiresAt ? new Date(stock.reservationExpiresAt).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex flex-wrap gap-2">
                  {stock.status === "AVAILABLE" && (
                    <>
                      <button onClick={() => setActionType("reserve")} className="admin-btn-secondary px-3 py-1.5 text-xs">
                        <Lock size={12} className="mr-1.5" /> Kunci/Reservasi
                      </button>
                      <button onClick={() => setActionType("manual")} className="admin-btn-secondary px-3 py-1.5 text-xs">
                        <User size={12} className="mr-1.5" /> Ambil Manual
                      </button>
                    </>
                  )}
                  {stock.status === "RESERVED" && (
                    <>
                      <button onClick={() => setActionType("release")} className="admin-btn-secondary px-3 py-1.5 text-xs">
                        <RefreshCw size={12} className="mr-1.5" /> Lepas Reservasi
                      </button>
                      <button onClick={() => setActionType("manual")} className="admin-btn-secondary px-3 py-1.5 text-xs">
                        <User size={12} className="mr-1.5" /> Ambil Manual
                      </button>
                    </>
                  )}
                  {(stock.status === "SOLD" || stock.status === "REPLACED") && (
                    <button onClick={() => setActionType("replace")} className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center transition cursor-pointer">
                      <Ban size={12} className="mr-1.5" /> Tandai Rusak & Ganti
                    </button>
                  )}
                </div>

                {/* Sensitive Data Panel */}
                <div>
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Lock size={12} /> Kredensial Terlindungi
                  </h4>
                  <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                    {stock.type === "EMAIL_PASSWORD" && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-600 uppercase tracking-wide font-semibold w-20 shrink-0">Email</span>
                          <span className="text-xs font-mono text-muted-foreground">{stock.email}</span>
                        </div>
                        <SensitiveDataField
                          label="Password"
                          value={null} // Requires async reveal
                          onReveal={() => handleRevealField("password")}
                        />
                        {stock.pin && (
                          <SensitiveDataField
                            label="PIN"
                            value={null}
                            onReveal={() => handleRevealField("pin")}
                          />
                        )}
                        {stock.profile && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-600 uppercase tracking-wide font-semibold w-20 shrink-0">Profil</span>
                            <span className="text-xs font-semibold text-primary bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">{stock.profile}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {stock.type === "LICENSE_KEY" && (
                      <SensitiveDataField
                        label="Lisensi"
                        value={null}
                        onReveal={() => handleRevealField("code")}
                      />
                    )}

                    {stock.type === "ACTIVATION_LINK" && (
                      <SensitiveDataField
                        label="Link"
                        value={null}
                        onReveal={() => handleRevealField("link")}
                      />
                    )}
                  </div>
                </div>

                {/* Assignment Info */}
                {stock.order && (
                  <div>
                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText size={12} /> Terhubung ke Pesanan
                    </h4>
                    <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-bold text-foreground">{stock.order.invoiceNo}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(stock.order.createdAt).toLocaleString()}</p>
                        </div>
                        <StatusBadge status={stock.order.status} size="sm" />
                      </div>
                      <div className="pt-2 border-t border-violet-500/10">
                        <p className="text-[10px] text-muted-foreground">Pembeli:</p>
                        <p className="text-xs font-semibold text-foreground">{stock.order.user.name} <span className="font-mono text-[10px] text-muted-foreground">({stock.order.user.email})</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Timeline */}
                <div>
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <History size={12} /> Riwayat Pergerakan
                  </h4>
                  <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-white/[0.04]">
                    {stock.movements?.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic pl-8">Belum ada pergerakan</p>
                    ) : (
                      stock.movements?.map((log: AuditLog, idx: number) => (
                        <div key={log.id} className="relative pl-8">
                          <div className={cn(
                            "absolute left-0 h-6 w-6 rounded-full border-4 border-[#0c0c12] flex items-center justify-center",
                            idx === 0 ? "bg-violet-500" : "bg-muted"
                          )}>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#0c0c12]" />
                          </div>
                          <div className="bg-card p-3 rounded-xl border border-border">
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-xs font-bold text-foreground">{log.action.replace(/_/g, " ")}</span>
                              <span className="text-[9px] text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2 text-[10px]">
                              <StatusBadge status={log.fromStatus} size="sm" className="scale-90 origin-left" />
                              <span className="text-zinc-600">→</span>
                              <StatusBadge status={log.toStatus} size="sm" className="scale-90 origin-left" />
                            </div>
                            {log.reason && (
                              <p className="text-[10px] text-muted-foreground italic">"{log.reason}"</p>
                            )}
                            <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-2 text-[9px]">
                              {log.admin && (
                                <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">By: {log.admin.name}</span>
                              )}
                              {log.customer && (
                                <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">To: {log.customer.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      <ConfirmDialog
        open={!!actionType}
        title={
          actionType === "reserve" ? "Kunci Stok Sementara" :
          actionType === "release" ? "Lepas Reservasi Stok" :
          actionType === "manual" ? "Ambil Stok Secara Manual" :
          "Tandai Rusak & Ganti"
        }
        description={
          actionType === "reserve" ? "Stok akan dikunci selama 15 menit agar tidak terambil oleh otomatisasi pesanan lain." :
          actionType === "release" ? "Stok akan dikembalikan ke status AVAILABLE." :
          actionType === "manual" ? "Peringatan: Aksi ini mengeluarkan stok dari sistem tanpa melalui flow pesanan. Stok menjadi SOLD." :
          "Stok ini akan ditandai rusak (REPLACED). Sistem akan otomatis mencari stok AVAILABLE baru (FEFO) untuk menggantikan posisi stok ini pada pesanan pembeli."
        }
        variant={actionType === "replace" || actionType === "manual" ? "danger" : "info"}
        confirmLabel="Proses"
        onConfirm={handleAction}
        onCancel={() => setActionType(null)}
      >
        <div className="mt-4 text-left">
          {actionType === "replace" && (
            <div className="mb-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">ID Pesanan Terkait</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground"
                placeholder="Order ID..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
          )}
          <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Alasan (Wajib)</label>
          <input
            type="text"
            required
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground"
            placeholder="Ketik alasan aksi..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </>
  );
}
