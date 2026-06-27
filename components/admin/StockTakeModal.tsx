"use client";

import { useState } from "react";
import { X, Key, ShieldCheck, AlertTriangle } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { cn } from "@/lib/utils";

interface StockTakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  packageId: string;
  onSuccess?: (stock: any) => void;
}

export function StockTakeModal({ isOpen, onClose, orderId, packageId, onSuccess }: StockTakeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleTakeStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stock/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengambil stok");

      if (onSuccess) onSuccess(data.stock);
      setConfirmOpen(false);
      onClose();
    } catch (err: any) {
      setError(err.message);
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ animation: "adminFadeIn 0.2s ease" }}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        
        <div 
          className="relative w-full max-w-lg bg-[#0c0c12] rounded-2xl shadow-2xl shadow-black border border-border overflow-hidden"
          style={{ animation: "adminSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Key size={16} />
              </div>
              <h2 className="text-sm font-bold text-foreground">Ambil Stok Otomatis</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">Algoritma FEFO</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sistem akan secara otomatis mencari stok <span className="text-emerald-400 font-semibold">AVAILABLE</span> yang paling mendekati tanggal kedaluwarsa (First Expired First Out).
                </p>
                <div className="mt-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3 text-amber-400/90 text-xs leading-relaxed">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <p>Stok yang diambil akan langsung ditandai sebagai <strong>SOLD</strong> dan permanen terhubung ke pesanan ini. Pastikan pembayaran telah dikonfirmasi.</p>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-card flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-foreground rounded-xl shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Memproses..." : "Mulai Ambil Stok"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Konfirmasi Pengambilan Stok"
        description="Apakah Anda yakin ingin memberikan stok ke pesanan ini? Aksi ini akan mengubah status stok menjadi SOLD."
        confirmLabel="Ya, Ambil Stok"
        variant="info"
        onConfirm={handleTakeStock}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
