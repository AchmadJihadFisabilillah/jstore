"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Check, X, AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Order {
  id: string;
  invoiceNo: string | null;
  createdAt: string;
  paymentProof: string | null;
  rejectionReason: string | null;
  status: string;
  user: {
    name: string;
    email: string;
  };
  package: {
    name: string;
    price: number;
    product: {
      name: string;
    };
  };
}

export function PaymentsManager() {
  const [payments, setPayments] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  // Rejection Form states
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [submitLoading, setSubmitLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        // Filter only orders with uploaded payment proofs (manual transfers)
        const manualPayments = data.filter((o: Order) => o.paymentProof !== null);
        setPayments(manualPayments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (id: string) => {
    setSubmitLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Pembayaran terverifikasi dan stok akun terkirim." });
        fetchPayments();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal memverifikasi pembayaran.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason) return;
    setSubmitLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING", rejectionReason: rejectReason }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Transfer manual berhasil ditolak." });
        setRejectId(null);
        setRejectReason("");
        fetchPayments();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal mengirim penolakan.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const verifiedPayments = payments.filter((p) => p.status === "PAID");

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {message.text}
        </div>
      )}

      {/* Tabs / sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Verification Queue (Left, 2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Antrean Verifikasi Transfer</h2>
            <p className="text-xs text-muted-foreground">Bukti transfer terunggah dari pembeli yang butuh validasi mutasi rekening.</p>
          </div>

          <div className="admin-card divide-y divide-white/5">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                <Loader2 className="animate-spin text-primary" size={16} /> Memuat antrean pembayaran...
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">Antrean verifikasi transfer kosong.</div>
            ) : (
              pendingPayments.map((p) => (
                <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted transition">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedSlip(p.paymentProof)}
                      className="h-16 w-12 rounded-lg border border-border bg-card flex items-center justify-center text-zinc-600 hover:text-foreground overflow-hidden group relative cursor-pointer"
                      title="Klik untuk perbesar slip"
                    >
                      {p.paymentProof ? (
                        <>
                          <img src={p.paymentProof} alt="Slip" className="h-full w-full object-cover group-hover:opacity-75 transition" />
                          <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <Eye size={12} className="text-foreground" />
                          </div>
                        </>
                      ) : (
                        <CreditCard size={16} />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{p.invoiceNo || "INV-GEN-PENDING"}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                        {p.user.name} ({p.user.email})
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Produk: {p.package.product.name} - {p.package.name}
                      </p>
                      <p className="text-xs font-extrabold text-primary mt-1">
                        Nominal Transfer: {formatIDR(p.package.price)}
                      </p>
                    </div>
                  </div>

                  {/* Verification Actions */}
                  <div className="flex flex-col gap-2 shrink-0 self-end md:self-center">
                    {rejectId === p.id ? (
                      <div className="space-y-2 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                        <Input
                          required
                          placeholder="Tulis alasan ditolak..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="py-1 text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRejectId(null)}
                            className="flex-1 bg-muted border border-border text-muted-foreground text-[10px] py-1 rounded font-bold"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={!rejectReason}
                            className="flex-1 bg-rose-600 text-foreground text-[10px] py-1 rounded font-bold disabled:opacity-50"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={submitLoading[p.id]}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-bold transition cursor-pointer"
                        >
                          {submitLoading[p.id] ? <Loader2 className="animate-spin" size={12} /> : <Check size={12} />} Setujui
                        </button>
                        <button
                          onClick={() => setRejectId(p.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-rose-400 hover:text-rose-300 text-xs font-bold transition cursor-pointer"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History of Manual Transfers (Right, 1/3 width) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Riwayat Terverifikasi</h2>
            <p className="text-xs text-muted-foreground">Daftar transfer manual yang disetujui akhir-akhir ini.</p>
          </div>

          <div className="admin-card divide-y divide-white/5 max-h-[28rem] overflow-y-auto custom-scrollbar">
            {verifiedPayments.length === 0 ? (
              <p className="text-center py-12 text-xs text-muted-foreground">Belum ada riwayat pembayaran manual.</p>
            ) : (
              verifiedPayments.map((v) => (
                <div key={v.id} className="p-3 text-xs space-y-1 hover:bg-muted transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{v.invoiceNo}</span>
                    <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10">Lunas</span>
                  </div>
                  <p className="text-muted-foreground font-semibold">{v.user.name}</p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>{v.package.product.name} - {v.package.name}</span>
                    <span className="font-extrabold text-foreground">{formatIDR(v.package.price)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slip Zoom Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full bg-card rounded-xl border border-border p-2 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-2 right-2 p-1 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer z-10"
            >
              <X size={18} />
            </button>
            <img src={selectedSlip} alt="Zoom Slip" className="max-h-[80vh] w-auto object-contain rounded-lg border border-border" />
          </div>
        </div>
      )}
    </div>
  );
}
