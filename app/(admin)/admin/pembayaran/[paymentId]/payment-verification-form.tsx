"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentVerificationForm({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [checks, setChecks] = useState({
    nominal: false,
    merchant: false,
    proofValid: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyetujui pembayaran");
      
      alert("Pembayaran berhasil disetujui!");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Alasan penolakan wajib diisi");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menolak pembayaran");
      
      alert("Pembayaran berhasil ditolak!");
      router.refresh();
      setRejectMode(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (rejectMode) {
    return (
      <div className="space-y-4 bg-red-900/10 p-4 rounded-xl border border-red-800/50">
        <h3 className="font-semibold text-red-400">Tolak Pembayaran</h3>
        <textarea
          placeholder="Berikan alasan penolakan (misal: Nominal tidak sesuai)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-red-500 focus:outline-none resize-none h-24"
        ></textarea>
        
        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        <div className="flex gap-3">
          <button
            onClick={() => setRejectMode(false)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 text-sm font-semibold"
          >
            Batal
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-semibold"
          >
            {loading ? "Memproses..." : "Konfirmasi Tolak"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-3">
        <h3 className="text-sm font-bold text-gray-300 mb-2">Checklist Verifikasi:</h3>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={checks.nominal} 
            onChange={(e) => setChecks({...checks, nominal: e.target.checked})}
            className="w-4 h-4 accent-magenta-500 rounded border-gray-600 bg-gray-700" 
          />
          <span className="text-sm text-gray-300">Nominal transfer sesuai dengan total tagihan</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={checks.merchant} 
            onChange={(e) => setChecks({...checks, merchant: e.target.checked})}
            className="w-4 h-4 accent-magenta-500 rounded border-gray-600 bg-gray-700" 
          />
          <span className="text-sm text-gray-300">Transfer ditujukan ke rekening/QRIS JSTORE yang benar</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={checks.proofValid} 
            onChange={(e) => setChecks({...checks, proofValid: e.target.checked})}
            className="w-4 h-4 accent-magenta-500 rounded border-gray-600 bg-gray-700" 
          />
          <span className="text-sm text-gray-300">Bukti pembayaran terlihat valid (bukan editan/palsu)</span>
        </label>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setRejectMode(true)}
          disabled={loading}
          className="px-4 py-3 bg-gray-800 text-red-400 hover:bg-red-900/20 border border-gray-700 hover:border-red-800 rounded-xl transition font-semibold disabled:opacity-50"
        >
          Tolak
        </button>
        <button
          onClick={handleApprove}
          disabled={loading || !allChecked}
          className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2"
        >
          {loading ? "Memproses..." : "Setujui Pembayaran"}
        </button>
      </div>
    </div>
  );
}
