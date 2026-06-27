"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";

export default function BuatTiketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultOrderId = searchParams.get("orderId") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  // Load orders for the select dropdown
  useEffect(() => {
    // We fetch user orders that are PAID or EXPIRED to report issues
    fetch("/api/user/orders")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
           setOrders(data.filter(o => o.status === "PAID" || o.status === "EXPIRED"));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      orderId: formData.get("orderId"),
      category: formData.get("category"),
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority"),
    };

    try {
      const res = await fetch("/api/user/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal membuat tiket");
      }

      const result = await res.json();
      router.push(`/dashboard/bantuan/${result.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bantuan" className="p-2 rounded-xl bg-muted hover:bg-muted text-foreground transition-colors border border-border">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Buat Tiket Baru</h1>
          <p className="text-muted-foreground text-sm mt-1">Sampaikan kendala Anda sejelas mungkin.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Kategori Masalah *</label>
            <select required name="category" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors">
              <option value="" disabled selected>Pilih Kategori...</option>
              <option value="PRODUK_BELUM_DITERIMA">Produk Belum Diterima</option>
              <option value="AKUN_TIDAK_BISA_LOGIN">Akun Tidak Bisa Login (Incorrect Password)</option>
              <option value="AKUN_TERKENA_LIMIT">Akun Terkena Screen Limit</option>
              <option value="MASA_AKTIF_TIDAK_SESUAI">Masa Aktif Tidak Sesuai</option>
              <option value="KODE_TIDAK_VALID">Kode Redeem / Voucher Tidak Valid</option>
              <option value="PERMINTAAN_PENGGANTIAN">Permintaan Penggantian Akun</option>
              <option value="MASALAH_PEMBAYARAN">Masalah Pembayaran</option>
              <option value="LAINNYA">Masalah Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pesanan Terkait (Opsional)</label>
            <select name="orderId" defaultValue={defaultOrderId} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors">
              <option value="">Pilih Pesanan jika terkait...</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.package?.product?.name} - {o.package?.name} (Inv: {o.invoiceNo || o.id.slice(-8).toUpperCase()})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1.5">Pilih pesanan agar admin dapat mempercepat proses pengecekan.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Judul Tiket *</label>
            <input 
              type="text" 
              name="title" 
              required
              placeholder="Contoh: Netflix tidak bisa login password salah" 
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Deskripsi Detail *</label>
            <textarea 
              name="description" 
              required
              rows={5}
              placeholder="Jelaskan kronologi dan detail masalah yang Anda alami..." 
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Prioritas</label>
            <select name="priority" defaultValue="MEDIUM" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors">
              <option value="LOW">Rendah (Pertanyaan umum)</option>
              <option value="MEDIUM">Sedang (Kendala penggunaan normal)</option>
              <option value="HIGH">Tinggi (Layanan mati total / tidak bisa akses)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border flex gap-4 justify-end">
            <Link href="/dashboard/bantuan" className="px-6 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-foreground px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-violet-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Mengirim..." : <><Save size={16} /> Kirim Tiket</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
