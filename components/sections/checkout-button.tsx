"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({ packageId }: { packageId: string }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      
      const data = (await response.json()) as { 
        invoiceNo?: string; 
        message?: string 
      };
      
      setLoading(false);
      
      if (!response.ok) {
        setError(data.message ?? "Gagal membuat transaksi.");
        return;
      }

      setSuccess("Transaksi berhasil dibuat. Mengalihkan ke pembayaran...");

      if (data.invoiceNo) {
        window.location.href = `/pembayaran/${data.invoiceNo}`;
      } else {
        setError("Detail nomor invoice pembayaran tidak didapatkan.");
      }
    } catch {
      setLoading(false);
      setError("Terjadi kesalahan sistem saat memproses checkout.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 pt-2">
        <Button onClick={handleCheckout} isLoading={loading} className="w-full">
          Bayar Sekarang (Mandiri QRIS)
        </Button>
        {error ? <p className="text-sm text-red-500 text-center">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-500 text-center">{success}</p> : null}
      </div>
    </div>
  );
}
