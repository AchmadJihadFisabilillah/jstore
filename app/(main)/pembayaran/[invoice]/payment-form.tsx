"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Payment, Order } from "@prisma/client";

export default function PaymentForm({
  payment,
  order,
}: {
  payment: Payment;
  order: Order;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Status check
  if (payment.status === "APPROVED") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-green-900/20 border border-green-800 rounded-xl">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-500 mb-2">Pembayaran Disetujui</h3>
        <p className="text-gray-400 mb-6">Terima kasih, pesanan Anda sedang diproses.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
        >
          Lihat Pesanan
        </button>
      </div>
    );
  }

  if (payment.status === "UNDER_REVIEW") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-yellow-900/20 border border-yellow-800 rounded-xl">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-yellow-500 mb-2">Sedang Diverifikasi</h3>
        <p className="text-gray-400 mb-6">Bukti pembayaran Anda sedang diperiksa oleh tim kami.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setFile(selected);
    setError(null);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Pilih bukti pembayaran terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("proof", file);

    try {
      const res = await fetch(`/api/payments/${payment.id}/proof`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengunggah bukti");
      }
      
      // Refresh router untuk mendapatkan data terbaru server component
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
      {payment.status === "REJECTED" && (
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-xl mb-4">
          <h4 className="font-semibold text-red-500 mb-1">Pembayaran Ditolak</h4>
          <p className="text-sm text-red-400">{payment.rejectionReason || "Bukti pembayaran tidak valid."}</p>
          <p className="text-sm text-gray-400 mt-2">Silakan unggah ulang bukti yang benar.</p>
        </div>
      )}

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nama Pengirim</label>
          <input 
            type="text" 
            name="senderName" 
            required 
            placeholder="Contoh: Budi Santoso"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-magenta-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Aplikasi / Bank</label>
          <input 
            type="text" 
            name="senderAccount" 
            required 
            placeholder="Contoh: BCA, GoPay, Dana"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-magenta-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Waktu Transfer</label>
          <input 
            type="datetime-local" 
            name="paymentTime" 
            required 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-magenta-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Bukti Transfer (Max 5MB)</label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-gray-500 transition cursor-pointer relative">
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp, application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {preview ? (
              <div className="relative h-32 w-full">
                <Image src={preview} alt="Preview" fill className="object-contain" />
              </div>
            ) : (
              <div className="py-6">
                <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm text-gray-400">Klik atau drag file ke sini</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Catatan (Opsional)</label>
          <textarea 
            name="customerNote" 
            rows={2}
            placeholder="Catatan tambahan..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-magenta-500 resize-none"
          ></textarea>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

      <button 
        type="submit" 
        disabled={isSubmitting || !file}
        className="w-full bg-magenta-600 hover:bg-magenta-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 mt-4"
      >
        {isSubmitting ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
      </button>
    </form>
  );
}
