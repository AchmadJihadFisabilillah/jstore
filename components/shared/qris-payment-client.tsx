"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { CreditCard, Loader2, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, ZoomIn } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

interface QrisPaymentClientProps {
  initialPayment: {
    id: string;
    amount: number;
    qrPayload: string | null;
    qrImageUrl: string | null;
    expiredAt: string | null;
    status: string;
  };
  order: {
    id: string;
    invoiceNo: string | null;
    package: {
      name: string;
      product: {
        name: string;
      };
    };
  };
}

export function QrisPaymentClient({ initialPayment, order }: QrisPaymentClientProps) {
  const [payment, setPayment] = useState(initialPayment);
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [zoomModal, setZoomModal] = useState(false);

  const pollCount = useRef(0);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  // Parse expiry date
  const expiryDate = useMemo(() => {
    return payment.expiredAt ? new Date(payment.expiredAt) : new Date();
  }, [payment.expiredAt]);

  // 1. Countdown Timer Effect
  useEffect(() => {
    if (payment.status !== "PENDING" || isExpired) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        setIsExpired(true);
        setPayment((prev) => ({ ...prev, status: "EXPIRED" }));
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [payment.status, isExpired, expiryDate]);

  // 2. Check status function
  const checkStatus = useCallback(async (manual = false) => {
    if (checking) return;
    if (manual) setChecking(true);

    try {
      const res = await fetch(`/api/payments/${payment.id}/check-status`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status !== payment.status) {
          setPayment((prev) => ({ ...prev, status: data.status }));
          if (data.status === "PAID") {
            setMessage({
              type: "success",
              text: "Pembayaran berhasil diverifikasi! Pesanan Anda sedang diproses.",
            });
            if (pollTimer.current) clearTimeout(pollTimer.current);
          }
        } else if (manual) {
          setMessage({
            type: "info",
            text: data.status === "PENDING" ? "Pembayaran belum terdeteksi. Silakan lakukan transfer terlebih dahulu." : `Status pembayaran saat ini: ${data.status}`,
          });
        }
      } else if (manual) {
        setMessage({ type: "error", text: "Gagal mengecek status pembayaran." });
      }
    } catch (err) {
      console.error(err);
      if (manual) setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      if (manual) setChecking(false);
    }
  }, [checking, payment.id, payment.status]);

  // 3. Polling Effect
  useEffect(() => {
    if (payment.status !== "PENDING") return;

    const runPolling = () => {
      pollCount.current += 1;
      checkStatus(false);

      // Adjust polling frequency based on counter to prevent heavy load
      let nextInterval = 5000; // 5 seconds initially
      if (pollCount.current > 12) nextInterval = 10000; // 10 seconds after 1 min
      if (pollCount.current > 24) nextInterval = 20000; // 20 seconds after 3 mins
      if (pollCount.current > 40) return; // Stop polling completely after ~10 mins

      pollTimer.current = setTimeout(runPolling, nextInterval);
    };

    pollTimer.current = setTimeout(runPolling, 5000);

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [payment.status, checkStatus]);

  // Generate QR Code URL from raw text data
  const qrCodeUrl = payment.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payment.qrPayload || "")}`;

  // Format expiration label
  const expiryLabel = expiryDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-6 text-foreground">
      {/* Return button */}
      <Link
        href="/dashboard/pesanan"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Lihat Daftar Pesanan
      </Link>

      <div className="card-jstore border border-border bg-card backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 h-32 w-32 -z-10 bg-violet-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-32 w-32 -z-10 bg-indigo-600/10 blur-[80px]" />

        {/* Invoice Header */}
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight">QRIS Dinamis Mandiri</h1>
              <p className="text-xs text-muted-foreground mt-1">Invoice: {order.invoiceNo || "N/A"}</p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
              ${payment.status === "PAID"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : payment.status === "PENDING"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {payment.status === "PAID" ? "LUNAS" : payment.status === "PENDING" ? "MENUNGGU BAYAR" : "KEDALUWARSA"}
            </span>
          </div>
        </div>

        {/* Flash Message */}
        {message && (
          <div
            onClick={() => setMessage(null)}
            className={`p-3.5 mb-6 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all
              ${message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : message.type === "error"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Product details */}
        <div className="bg-[#12121a]/50 border border-white/[0.03] rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Produk</span>
            <span className="font-semibold text-foreground">{order.package.product.name}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Paket</span>
            <span className="font-semibold text-foreground">{order.package.name}</span>
          </div>
          <div className="flex justify-between text-base font-bold mt-4 pt-3 border-t border-border">
            <span className="text-muted-foreground">Total Nominal</span>
            <span className="text-primary text-lg font-black">{formatRupiah(payment.amount)}</span>
          </div>
        </div>

        {/* Payment QRIS Scan Block */}
        {payment.status === "PENDING" && (
          <div className="flex flex-col items-center justify-center my-6">
            <p className="text-xs text-amber-400 font-semibold mb-3 flex items-center gap-1.5 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">
              <CreditCard size={12} /> Scan QRIS di bawah ini untuk membayar
            </p>

            {/* QR Frame */}
            <div className="relative p-4 bg-white rounded-2xl shadow-xl max-w-[260px] w-full aspect-square flex items-center justify-center group overflow-hidden border-4 border-violet-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="Mandiri QRIS Barcode"
                className="w-full h-full object-contain select-none"
              />
              <button
                onClick={() => setZoomModal(true)}
                className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-foreground font-bold text-xs transition duration-200 cursor-pointer"
              >
                <ZoomIn size={18} /> Perbesar QRIS
              </button>
            </div>

            {/* Expired Countdown */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">Selesaikan sebelum:</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{expiryLabel}</p>

              <div className="mt-4 flex items-baseline justify-center gap-2">
                <span className="text-xs text-muted-foreground">Sisa Waktu:</span>
                <span className="text-3xl font-black font-mono text-primary tracking-tight">
                  {timeLeft || "00:00"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Paid / Success State */}
        {payment.status === "PAID" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Pembayaran Berhasil!</h2>
            <p className="text-xs text-muted-foreground max-w-xs mt-2">
              Terima kasih, pembayaran Anda telah kami konfirmasi secara otomatis. Stok produk digital Anda sedang disiapkan.
            </p>
            <Link
              href={`/dashboard/pesanan/${order.id}`}
              className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-foreground font-bold text-xs transition"
            >
              Lihat Status Pengiriman Stok
            </Link>
          </div>
        )}

        {/* Expired / Cancelled State */}
        {payment.status === "EXPIRED" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle size={36} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Pembayaran Kedaluwarsa</h2>
            <p className="text-xs text-muted-foreground max-w-xs mt-2">
              Waktu pembayaran 15 menit telah habis. Kode QRIS ini tidak dapat digunakan lagi.
            </p>
            <Link
              href={`/produk`}
              className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs transition"
            >
              Buat Pesanan Baru
            </Link>
          </div>
        )}

        {/* Interactive Buttons */}
        {payment.status === "PENDING" && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => checkStatus(true)}
              disabled={checking}
              className="flex items-center justify-center gap-2 border border-border bg-[#0e0e14] hover:bg-muted text-muted-foreground px-4 py-3 rounded-xl font-bold text-xs transition disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {checking ? (
                <Loader2 className="animate-spin text-primary" size={14} />
              ) : (
                <RefreshCw size={14} />
              )}
              Cek Status Pembayaran
            </button>
            <Link
              href={`/dashboard/pesanan/${order.id}`}
              className="flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-foreground px-4 py-3 rounded-xl font-bold text-xs transition text-center min-h-[44px]"
            >
              Lihat Pesanan
            </Link>
          </div>
        )}

        {/* Petunjuk Pembayaran Block */}
        {payment.status === "PENDING" && (
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Petunjuk Pembayaran</h3>
            <ul className="text-[11px] text-muted-foreground space-y-2 list-decimal pl-4">
              <li>Buka aplikasi e-wallet Anda (GoPay, OVO, Dana, LinkAja) atau Mobile Banking (Livin&apos; by Mandiri, BCA Mobile, dll).</li>
              <li>Pilih menu scan QRIS pembayaran.</li>
              <li>Arahkan kamera ke QRIS di halaman ini atau upload tangkapan layar (screenshot) kode QRIS.</li>
              <li>Periksa kesesuaian nominal tagihan sebesar <span className="text-primary font-semibold">{formatRupiah(payment.amount)}</span>.</li>
              <li>Konfirmasi pembayaran dan masukkan PIN Anda.</li>
              <li>Status transaksi akan berubah otomatis menjadi <strong>LUNAS</strong> dalam waktu beberapa detik setelah sukses di-scan.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-md w-full bg-card rounded-2xl border border-border p-6 flex flex-col items-center">
            <button
              onClick={() => setZoomModal(false)}
              className="absolute top-3 right-3 text-xs text-muted-foreground hover:text-foreground bg-muted px-2.5 py-1.5 rounded-lg border border-border cursor-pointer font-semibold"
            >
              Tutup
            </button>
            <h3 className="text-sm font-bold text-foreground mb-6">Pindai QRIS JStore</h3>
            <div className="p-4 bg-white rounded-2xl w-full aspect-square max-w-[320px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="Zoomed QRIS" className="w-full h-full object-contain" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 font-semibold">Tunjukkan atau scan barcode ini menggunakan e-wallet/M-Banking Anda.</p>
          </div>
        </div>
      )}
    </div>
  );
}
