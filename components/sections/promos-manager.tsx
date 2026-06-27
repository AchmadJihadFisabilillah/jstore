"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Percent, Loader2, Tag, Calendar, Check, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Voucher {
  id: string;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  maxDiscount: number | null;
  minPurchase: number;
  quota: number;
  usedCount: number;
  maxPerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export function PromosManager() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("NOMINAL");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minPurchase, setMinPurchase] = useState("0");
  const [quota, setQuota] = useState("100");
  const [maxPerUser, setMaxPerUser] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vouchers");
      if (res.ok) {
        const data = await res.json();
        setVouchers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openAddDrawer = () => {
    setEditingVoucher(null);
    setCode("");
    setName("");
    setDiscountType("NOMINAL");
    setDiscountValue("");
    setMaxDiscount("");
    setMinPurchase("0");
    setQuota("100");
    setMaxPerUser("1");
    
    // Set default dates: today and next month
    const today = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().slice(0, 10);
    
    setStartDate(today);
    setEndDate(nextMonthStr);
    setIsActive(true);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (v: Voucher) => {
    setEditingVoucher(v);
    setCode(v.code);
    setName(v.name);
    setDiscountType(v.discountType);
    setDiscountValue(String(v.discountValue));
    setMaxDiscount(v.maxDiscount ? String(v.maxDiscount) : "");
    setMinPurchase(String(v.minPurchase));
    setQuota(String(v.quota));
    setMaxPerUser(String(v.maxPerUser));
    setStartDate(new Date(v.startDate).toISOString().slice(0, 10));
    setEndDate(new Date(v.endDate).toISOString().slice(0, 10));
    setIsActive(v.isActive);
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitLoading(true);

    const payload = {
      code,
      name,
      discountType,
      discountValue,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minPurchase: Number(minPurchase) || 0,
      quota: Number(quota) || 100,
      maxPerUser: Number(maxPerUser) || 1,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive,
    };

    try {
      const url = editingVoucher ? `/api/admin/vouchers/${editingVoucher.id}` : "/api/admin/vouchers";
      const method = editingVoucher ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses voucher");
      }

      setActionMessage({
        type: "success",
        text: editingVoucher ? "Voucher berhasil diperbarui!" : "Voucher baru berhasil ditambahkan!",
      });
      setDrawerOpen(false);
      fetchVouchers();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (v: Voucher) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kupon diskon "${v.code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/vouchers/${v.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus voucher");
      }

      setActionMessage({ type: "success", text: "Voucher diskon berhasil dihapus." });
      fetchVouchers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (v: Voucher) => {
    try {
      const res = await fetch(`/api/admin/vouchers/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !v.isActive }),
      });
      if (res.ok) {
        setVouchers((prev) =>
          prev.map((item) => (item.id === v.id ? { ...item, isActive: !item.isActive } : item))
        );
        setActionMessage({ type: "success", text: `Status voucher ${v.code} diperbarui.` });
      }
    } catch (err) {
      console.error(err);
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

      {/* Control Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Kupon & Voucher Diskon</h2>
          <p className="text-xs text-muted-foreground">Buat kupon marketing nominal tetap atau persentase potongan harga dengan batas kuota beli.</p>
        </div>
        <Button onClick={openAddDrawer} className="inline-flex items-center gap-1.5 self-start sm:self-center">
          <Plus size={16} /> Tambah Kupon
        </Button>
      </div>

      {/* Vouchers Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat data kupon...
          </div>
        ) : vouchers.length === 0 ? (
          <div className="admin-empty-state">
            <Tag size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Tidak ada kupon diskon terdaftar.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs admin-table">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="p-4">Kode Kupon / Deskripsi</th>
                  <th className="p-4">Jenis & Nilai Potongan</th>
                  <th className="p-4">Aturan Batasan</th>
                  <th className="p-4 text-center">Penggunaan Quota</th>
                  <th className="p-4">Masa Aktif Kupon</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id} className="group align-top">
                    <td className="p-4">
                      <span className="font-extrabold text-primary text-sm flex items-center gap-1">
                        <Tag size={12} /> {v.code}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block font-semibold">{v.name}</span>
                    </td>
                    <td className="p-4 font-semibold">
                      {v.discountType === "PERCENTAGE" ? (
                        <span className="text-foreground block">Diskon: {v.discountValue}%</span>
                      ) : (
                        <span className="text-foreground block">Potongan: {formatIDR(v.discountValue)}</span>
                      )}
                      {v.maxDiscount && (
                        <span className="text-[9px] text-muted-foreground block">Maksimal: {formatIDR(v.maxDiscount)}</span>
                      )}
                    </td>
                    <td className="p-4 space-y-0.5 text-muted-foreground">
                      <p>Minimal Beli: {formatIDR(v.minPurchase)}</p>
                      <p className="text-[10px] text-muted-foreground">Limit per user: {v.maxPerUser}x</p>
                    </td>
                    <td className="p-4 text-center font-bold">
                      <span className="text-foreground">{v.usedCount}</span>
                      <span className="text-muted-foreground"> / {v.quota}</span>
                    </td>
                    <td className="p-4 text-muted-foreground space-y-0.5 font-medium">
                      <p className="flex items-center gap-1"><Calendar size={10} /> {new Date(v.startDate).toLocaleDateString("id-ID")}</p>
                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar size={10} /> s.d {new Date(v.endDate).toLocaleDateString("id-ID")}</p>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(v)}
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border transition cursor-pointer ${
                          v.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {v.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditDrawer(v)}
                          className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="p-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Form Drawer */}
      {drawerOpen && (
        <div className="admin-drawer-overlay">
          <div className="admin-drawer-panel p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <h3 className="text-base font-bold text-foreground">
                  {editingVoucher ? "Edit Kupon Diskon" : "Tambah Kupon Baru"}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Kode Kupon (Kode Unik)</label>
                    <Input required placeholder="PROMOHEMAT" value={code} onChange={(e) => setCode(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nama Kampanye Kupon</label>
                    <Input required placeholder="Diskon Awal Bulan" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Jenis Potongan</label>
                    <select
                      className="w-full rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-foreground outline-none ring-[var(--primary)] focus:ring-2"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="NOMINAL">Nominal Rupiah (Rp)</option>
                      <option value="PERCENTAGE">Persentase (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nilai Potongan</label>
                    <Input required type="number" placeholder="5000" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
                  </div>
                </div>

                {discountType === "PERCENTAGE" && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Batas Diskon Maksimal (Rp) - Opsional</label>
                    <Input type="number" placeholder="10000" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Min. Belanja (Rp)</label>
                    <Input type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Kapasitas Quota</label>
                    <Input type="number" value={quota} onChange={(e) => setQuota(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Limit per User</label>
                    <Input type="number" value={maxPerUser} onChange={(e) => setMaxPerUser(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Mulai Berlaku</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Masa Kadaluarsa</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isVoucherActive"
                    className="h-4 w-4 rounded border-border bg-muted text-violet-600 accent-violet-600 focus:ring-violet-500 cursor-pointer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="isVoucherActive" className="text-xs font-semibold text-foreground select-none cursor-pointer">
                    Aktifkan kupon ini agar bisa diklaim pembeli
                  </label>
                </div>

                {formError && <p className="text-xs text-red-500 font-semibold">{formError}</p>}
              </form>
            </div>

            <div className="pt-6 border-t border-border flex gap-2">
              <Button onClick={() => setDrawerOpen(false)} className="flex-1 bg-muted hover:bg-muted text-foreground">
                Batal
              </Button>
              <Button onClick={handleSubmit} className="flex-1" isLoading={submitLoading}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
