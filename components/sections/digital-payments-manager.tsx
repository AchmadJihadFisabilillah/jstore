"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Check, RefreshCw, AlertTriangle, Eye, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";

interface Payment {
  id: string;
  orderId: string;
  provider: string;
  method: string;
  providerTransactionId: string | null;
  providerReference: string | null;
  amount: number;
  status: string;
  providerStatus: string | null;
  qrPayload: string | null;
  expiredAt: string | null;
  paidAt: string | null;
  createdAt: string;
  order: {
    invoiceNo: string | null;
    status: string;
    user: {
      name: string;
      email: string;
    };
    package: {
      name: string;
      product: {
        name: string;
      };
    };
  };
  attempts: any[];
}

interface WebhookEvent {
  id: string;
  provider: string;
  eventId: string | null;
  providerTransactionId: string | null;
  signatureValid: boolean;
  eventType: string | null;
  processingStatus: string;
  receivedAt: string;
}

export function DigitalPaymentsManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      
      const res = await fetch(`/api/admin/payments?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
        setWebhookEvents(data.webhookEvents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCheckStatus = async (paymentId: string) => {
    setActionLoading((prev) => ({ ...prev, [paymentId]: true }));
    try {
      const res = await fetch(`/api/payments/${paymentId}/check-status`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({
          type: "success",
          text: `Status berhasil disinkronkan. Status Provider: ${data.status}`,
        });
        fetchPayments();
        
        // Update details modal if open
        if (selectedPayment && selectedPayment.id === paymentId) {
          setSelectedPayment((prev) => prev ? { ...prev, status: data.status } : null);
        }
      } else {
        setMessage({ type: "error", text: "Gagal mengecek status ke provider API." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setActionLoading((prev) => ({ ...prev, [paymentId]: false }));
    }
  };

  const handleManualProcessOrder = async (orderId: string) => {
    const confirmApprove = window.confirm("Apakah Anda yakin ingin memproses pesanan ini secara manual?");
    if (!confirmApprove) return;

    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Pesanan berhasil ditandai LUNAS dan stok dikirim." });
        fetchPayments();
        setSelectedPayment(null);
      } else {
        const data = await res.json();
        alert(data.message || "Gagal memproses pesanan.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Helper formatting dates
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          onClick={() => setMessage(null)}
          className={`p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 cursor-pointer
            ${message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Cari Invoice, Transaksi ID, Nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted border border-border px-3 py-2 rounded-lg"
        >
          <RefreshCw size={12} /> Segarkan Data
        </button>
      </div>

      {/* main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payments List (Left, 2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="admin-card divide-y divide-white/5">
            <div className="p-4 bg-card">
              <h2 className="text-sm font-bold text-foreground">Log Transaksi Payment Gateway</h2>
              <p className="text-xs text-muted-foreground">Semua riwayat pemrosesan sistem pembayaran digital Mandiri QRIS.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                <Loader2 className="animate-spin text-primary" size={16} /> Memuat transaksi digital...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">Tidak ada riwayat transaksi ditemukan.</div>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted transition">
                  <div className="flex gap-3">
                    <div className="p-2.5 h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground self-start">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{p.order.invoiceNo || "N/A"}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {p.provider} ({p.method})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {p.order.user.name} • {p.order.package.product.name} ({p.order.package.name})
                      </p>
                      <p className="text-[10px] text-primary font-bold mt-1">
                        Nominal: {formatRupiah(p.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border
                        ${p.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : p.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                    >
                      {p.status}
                    </span>

                    <button
                      onClick={() => setSelectedPayment(p)}
                      className="p-1.5 rounded-lg border border-border bg-[#0e0e14] hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Lihat Rincian"
                    >
                      <Eye size={12} />
                    </button>

                    {p.status === "PENDING" && (
                      <button
                        onClick={() => handleCheckStatus(p.id)}
                        disabled={actionLoading[p.id]}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-foreground text-[10px] font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading[p.id] ? (
                          <Loader2 className="animate-spin" size={10} />
                        ) : (
                          <RefreshCw size={10} />
                        )}
                        Sync
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Callback Webhook Log List (Right, 1/3 width) */}
        <div className="space-y-4">
          <div className="admin-card divide-y divide-white/5">
            <div className="p-4 bg-card">
              <h2 className="text-sm font-bold text-foreground">Callback Webhook Log</h2>
              <p className="text-xs text-muted-foreground">Response events log dari server Mandiri QRIS.</p>
            </div>

            {loading ? (
              <p className="text-center py-6 text-xs text-muted-foreground">Memuat log callback...</p>
            ) : webhookEvents.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground">Belum ada callback log masuk.</p>
            ) : (
              webhookEvents.map((evt) => (
                <div key={evt.id} className="p-3 text-[11px] space-y-1 hover:bg-muted transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground font-mono truncate max-w-[120px]">
                      {evt.providerTransactionId || "No TX ID"}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase
                        ${evt.processingStatus === "PROCESSED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                        }`}
                    >
                      {evt.processingStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={10} className={evt.signatureValid ? "text-emerald-400" : "text-rose-400"} />
                      Sig: {evt.signatureValid ? "Valid" : "Error"}
                    </span>
                    <span>{new Date(evt.receivedAt).toLocaleTimeString("id-ID")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rincian Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-card rounded-2xl border border-border p-6 shadow-2xl flex flex-col">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 text-xs text-muted-foreground hover:text-foreground cursor-pointer bg-muted border border-border px-2.5 py-1.5 rounded-lg"
            >
              Tutup
            </button>

            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-6">
              <CreditCard size={18} className="text-primary" /> Detail Pembayaran Digital
            </h3>

            <div className="space-y-3.5 text-xs text-muted-foreground max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-bold text-foreground text-right">{selectedPayment.order.invoiceNo || "-"}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Pelanggan</span>
                <span className="text-foreground text-right">
                  {selectedPayment.order.user.name} ({selectedPayment.order.user.email})
                </span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Produk / Paket</span>
                <span className="text-foreground text-right">
                  {selectedPayment.order.package.product.name} - {selectedPayment.order.package.name}
                </span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Nominal</span>
                <span className="font-black text-primary text-right">{formatRupiah(selectedPayment.amount)}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Provider / Metode</span>
                <span className="text-foreground text-right font-mono uppercase">
                  {selectedPayment.provider} ({selectedPayment.method})
                </span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Mandiri Transaction ID</span>
                <span className="text-foreground text-right font-mono text-[10px]">
                  {selectedPayment.providerTransactionId || "-"}
                </span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Provider Reference</span>
                <span className="text-foreground text-right font-mono text-[10px]">
                  {selectedPayment.providerReference || "-"}
                </span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Status Transaksi</span>
                <span className="text-foreground text-right font-bold uppercase">{selectedPayment.status}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Status Pesanan</span>
                <span className="text-foreground text-right font-bold uppercase">{selectedPayment.order.status}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Dibuat Pada</span>
                <span className="text-foreground text-right">{formatDateTime(selectedPayment.createdAt)}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Kedaluwarsa Pada</span>
                <span className="text-foreground text-right">{formatDateTime(selectedPayment.expiredAt)}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-border pb-2">
                <span className="text-muted-foreground">Dibayar Pada</span>
                <span className="text-foreground text-right">{formatDateTime(selectedPayment.paidAt)}</span>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="mt-6 pt-4 border-t border-border flex gap-3 justify-end">
              {selectedPayment.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleCheckStatus(selectedPayment.id)}
                    disabled={actionLoading[selectedPayment.id]}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-[#0e0e14] hover:bg-muted text-foreground font-bold text-xs transition cursor-pointer"
                  >
                    <RefreshCw size={12} /> Cek Status Live
                  </button>
                  <button
                    onClick={() => handleManualProcessOrder(selectedPayment.orderId)}
                    disabled={actionLoading[selectedPayment.orderId]}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground font-bold text-xs transition cursor-pointer"
                  >
                    <Check size={12} /> Loloskan Manual (Kirim Akun)
                  </button>
                </>
              )}
              {selectedPayment.status === "PAID" && (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={14} /> Transaksi Telah Selesai & Terdistribusi.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
