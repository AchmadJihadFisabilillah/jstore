"use client";

import { useEffect, useState } from "react";
import { Undo2, X, Loader2, Check, AlertTriangle, Eye, ShieldAlert , RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Refund {
  id: string;
  refundNo: string;
  orderId: string;
  userId: string;
  reason: string;
  amount: number;
  status: string;
  attachment: string | null;
  notes: string | null;
  processedBy: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  order: {
    invoiceNo: string | null;
    package: {
      name: string;
      product: {
        name: string;
      };
    };
  };
}

export function RefundsManager() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  // Form states
  const [notesText, setNotesText] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/refunds");
      if (res.ok) {
        const data = await res.json();
        setRefunds(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleOpenDetail = (ref: Refund) => {
    setSelectedRefund(ref);
    setNotesText(ref.notes || "");
  };

  const handleProcessRefund = async (newStatus: string) => {
    if (!selectedRefund) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/admin/refunds/${selectedRefund.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: notesText }),
      });

      if (res.ok) {
        setActionMessage({
          type: "success",
          text: `Refund status updated to ${newStatus}`,
        });
        setSelectedRefund(null);
        fetchRefunds();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update refund");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "REFUNDED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  useEffect(() => {
    if (actionMessage) {
      const t = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionMessage]);

  return (
    <div className="space-y-4">
      {actionMessage && (
        <div className="p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {actionMessage.text}
        </div>
      )}

      {/* Refunds Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat klaim refund...
          </div>
        ) : refunds.length === 0 ? (
          <div className="admin-empty-state">
            <RefreshCw size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Tidak ada pengajuan refund saat ini.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs admin-table">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="p-4">No. Refund / Tanggal</th>
                  <th className="p-4">Customer / Invoice</th>
                  <th className="p-4">Alasan Refund</th>
                  <th className="p-4 text-right">Jumlah Uang</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((ref) => (
                  <tr key={ref.id} className="group align-top">
                    <td className="p-4">
                      <span className="font-extrabold text-foreground block">#{ref.refundNo}</span>
                      <span className="text-[9px] text-muted-foreground block">
                        {new Date(ref.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-muted-foreground block">{ref.user.name}</span>
                      <span className="text-[10px] text-primary block font-bold">{ref.order.invoiceNo || "N/A"}</span>
                    </td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">{ref.reason}</td>
                    <td className="p-4 text-right font-extrabold text-foreground">
                      {formatIDR(ref.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${getStatusBadge(ref.status)}`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(ref)}
                        className="px-3 py-1 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition text-[11px] font-bold cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedRefund && (
        <div className="admin-drawer-overlay">
          <div className="admin-drawer-panel p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Undo2 size={18} className="text-primary" /> Detail Klaim Refund
                </h3>
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5 text-xs">
                {/* Header refund Info */}
                <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">No. Refund</p>
                    <p className="text-sm font-extrabold text-foreground">#{selectedRefund.refundNo}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold border ${getStatusBadge(selectedRefund.status)}`}>
                    {selectedRefund.status}
                  </span>
                </div>

                {/* Reason & Amount */}
                <div className="bg-[#09090e]/60 p-4 rounded-xl border border-border space-y-3">
                  <div>
                    <p className="text-muted-foreground">Pelanggan</p>
                    <p className="font-bold text-foreground">{selectedRefund.user.name} ({selectedRefund.user.email})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice Terkait</p>
                    <p className="font-bold text-primary">{selectedRefund.order.invoiceNo || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Alasan Pengajuan</p>
                    <p className="font-bold text-foreground mt-0.5">{selectedRefund.reason}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jumlah Uang Refund</p>
                    <p className="text-sm font-extrabold text-rose-400 mt-0.5">{formatIDR(selectedRefund.amount)}</p>
                  </div>
                </div>

                {/* Proof attachment screenshot */}
                {selectedRefund.attachment && (
                  <div>
                    <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">Bukti Kendala Akun</h4>
                    <div className="bg-card p-2.5 rounded-xl border border-border flex flex-col items-center">
                      <button onClick={() => setZoomImg(selectedRefund.attachment)} className="block w-full text-center cursor-pointer">
                        <img
                          src={selectedRefund.attachment}
                          alt="Bukti kendala"
                          className="max-h-48 object-contain rounded-lg border border-border mx-auto hover:opacity-85 transition"
                        />
                        <span className="text-[10px] text-primary mt-2 block underline font-bold">Perbesar Gambar</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Process notes */}
                <div>
                  <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">Catatan Staf Pengolah</h4>
                  <textarea
                    className="w-full min-h-20 rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-foreground outline-none ring-[var(--primary)] placeholder:text-muted-foreground focus:ring-2"
                    placeholder="Tulis detail catatan transfer balik, penolakan klaim, dll..."
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                  />
                  {selectedRefund.processedBy && (
                    <p className="text-[10px] text-muted-foreground mt-1">Diproses oleh staf: {selectedRefund.processedBy}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions for Pending refund claims */}
            <div className="pt-6 border-t border-border">
              {selectedRefund.status === "PENDING" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleProcessRefund("REJECTED")}
                    disabled={submitLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-semibold py-2.5 rounded-xl border border-rose-500/20 cursor-pointer transition"
                  >
                    Tolak Refund
                  </button>
                  <button
                    onClick={() => handleProcessRefund("APPROVED")}
                    disabled={submitLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-foreground font-semibold py-2.5 rounded-xl cursor-pointer transition"
                  >
                    Setujui & Refund
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="w-full bg-muted hover:bg-muted text-foreground font-semibold py-2.5 rounded-xl"
                >
                  Tutup Detail
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zoom Img modal */}
      {zoomImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full bg-card rounded-xl border border-border p-2 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setZoomImg(null)}
              className="absolute top-2 right-2 p-1 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer z-10"
            >
              <X size={18} />
            </button>
            <img src={zoomImg} alt="Zoom Bukti" className="max-h-[80vh] w-auto object-contain rounded-lg border border-border" />
          </div>
        </div>
      )}
    </div>
  );
}
