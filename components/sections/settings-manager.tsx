"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Configurations
  const [siteName, setSiteName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [paymentFee, setPaymentFee] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [currency, setCurrency] = useState("IDR");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSiteName(data.site_name || "");
        setWhatsappNumber(data.whatsapp_number || "");
        setSupportEmail(data.support_email || "");
        setPaymentFee(data.payment_fee || "");
        setMaintenanceMode(data.maintenance_mode === "true");
        setCurrency(data.currency || "IDR");
        setInvoicePrefix(data.invoice_prefix || "INV");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      site_name: siteName,
      whatsapp_number: whatsappNumber,
      support_email: supportEmail,
      payment_fee: paymentFee,
      maintenance_mode: String(maintenanceMode),
      currency: currency,
      invoice_prefix: invoicePrefix,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setActionMessage({ type: "success", text: "Pengaturan utama sistem berhasil disimpan!" });
      } else {
        const data = await res.json();
        throw new Error(data.message || "Gagal memperbarui pengaturan.");
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Kesalahan jaringan." });
    } finally {
      setSubmitLoading(false);
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
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
          <Loader2 className="animate-spin text-primary" size={20} /> Memuat konfigurasi sistem...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          {/* Left panel: Core metadata */}
          <div className="card-jstore p-5 border border-border bg-[#09090e]/60 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Profil & Kontak Toko</h3>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nama Website (Situs)</label>
              <Input required placeholder="JStore" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nomor WhatsApp Notifikasi (Format Internasional)</label>
              <Input required placeholder="6281234567890" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
              <span className="text-[10px] text-muted-foreground mt-1 block">Gunakan awalan kode negara tanpa tanda "+" (misal: 628...).</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email Support Bantuan</label>
              <Input required placeholder="support@jstore.id" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
          </div>

          {/* Right panel: Financial and maintenance configuration */}
          <div className="card-jstore p-5 border border-border bg-[#09090e]/60 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Transaksi & Keamanan</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Prefix Kode Invoice</label>
                  <Input required placeholder="INV" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Mata Uang Tampil</label>
                  <Input required placeholder="IDR" value={currency} onChange={(e) => setCurrency(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Biaya Penanganan Transfer Manual (Rp)</label>
                <Input required type="number" placeholder="1000" value={paymentFee} onChange={(e) => setPaymentFee(e.target.value)} />
              </div>

              {/* Maintenance mode toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                <div>
                  <label className="text-xs font-bold text-foreground block">Mode Pemeliharaan (Maintenance)</label>
                  <span className="text-[10px] text-muted-foreground leading-normal block mt-0.5">
                    Aktifkan ini untuk mengunci toko dari transaksi publik.
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-border bg-muted text-violet-600 accent-violet-600 focus:ring-violet-500 cursor-pointer"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-1.5 mt-6" isLoading={submitLoading}>
              <Save size={16} /> Simpan Pengaturan
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
