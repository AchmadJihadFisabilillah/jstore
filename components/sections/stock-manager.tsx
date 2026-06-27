"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Loader2, Key, Info, HelpCircle, Download , Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductLogo } from "@/components/admin";
import { StockDetailDrawer } from "@/components/admin/StockDetailDrawer";

interface Product {
  id: string;
  name: string;
  packages: {
    id: string;
    name: string;
    sku: string | null;
  }[];
}

interface DigitalStock {
  id: string;
  packageId: string;
  type: string;
  email: string | null;
  password: string | null;
  pin: string | null;
  code: string | null;
  link: string | null;
  profile: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  package: {
    name: string;
    product: {
      name: string;
    };
  };
}

export function StockManager() {
  const [stocks, setStocks] = useState<DigitalStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<DigitalStock | null>(null);
  const [detailStockId, setDetailStockId] = useState<string | null>(null);

  // Filters
  const [selectedProductFilter, setSelectedProductFilter] = useState("");
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  // Form State
  const [packageId, setPackageId] = useState("");
  const [type, setType] = useState("EMAIL_PASSWORD");
  const [isBulk, setIsBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  
  // Single Stock Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [profile, setProfile] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [expiryDate, setExpiryDate] = useState("");

  // Revealed credentials cache
  const [revealedIds, setRevealedIds] = useState<Record<string, { password?: string; pin?: string; code?: string }>>({});
  const [revealLoading, setRevealLoading] = useState<Record<string, boolean>>({});

  const [formError, setFormError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStocks = async () => {
    setLoading(true);
    try {
      let query = "?";
      if (selectedPackageFilter) query += `packageId=${selectedPackageFilter}&`;
      if (selectedStatusFilter) query += `status=${selectedStatusFilter}&`;
      if (type && !isBulk) query += `type=${type}&`;

      const res = await fetch(`/api/admin/stock${query}`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [selectedPackageFilter, selectedStatusFilter]);

  const openAddDrawer = () => {
    setEditingStock(null);
    setPackageId(products[0]?.packages[0]?.id || "");
    setType("EMAIL_PASSWORD");
    setIsBulk(false);
    setBulkText("");
    setEmail("");
    setPassword("");
    setPin("");
    setCode("");
    setLink("");
    setProfile("");
    setNotes("");
    setStatus("AVAILABLE");
    setExpiryDate("");
    setFormError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (stock: DigitalStock) => {
    setEditingStock(stock);
    setPackageId(stock.packageId);
    setType(stock.type);
    setIsBulk(false);
    setBulkText("");
    setEmail(stock.email || "");
    setPassword(""); // Keep password input empty for edits unless setting new
    setPin(stock.pin || "");
    setCode(stock.code || "");
    setLink(stock.link || "");
    setProfile(stock.profile || "");
    setNotes(stock.notes || "");
    setStatus(stock.status);
    setExpiryDate(""); // Handle date later if needed
    setFormError("");
    setDrawerOpen(true);
  };

  const handleReveal = async (id: string) => {
    if (revealedIds[id]) {
      // Toggle off if already revealed
      const updated = { ...revealedIds };
      delete updated[id];
      setRevealedIds(updated);
      return;
    }

    setRevealLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`/api/admin/stock/${id}/reveal`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setRevealedIds((prev) => ({
          ...prev,
          [id]: {
            password: data.password,
            pin: data.pin,
            code: data.code,
          },
        }));
      } else {
        alert(data.message || "Gagal mengungkap kredensial.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevealLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitLoading(true);

    const payload = {
      packageId,
      type,
      isBulk,
      bulkText,
      email,
      password,
      pin,
      code,
      link,
      profile,
      notes,
      status,
      expiryDate: expiryDate || null,
    };

    try {
      const url = editingStock ? `/api/admin/stock/${editingStock.id}` : "/api/admin/stock";
      const method = editingStock ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses stok digital");
      }

      setActionMessage({
        type: "success",
        text: editingStock ? "Stok digital berhasil diperbarui!" : `Berhasil menambahkan ${data.count || 1} stok digital!`,
      });
      setDrawerOpen(false);
      fetchStocks();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (stock: DigitalStock) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item stok digital ini?")) return;

    try {
      const res = await fetch(`/api/admin/stock/${stock.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus stok");
      }

      setActionMessage({ type: "success", text: "Stok digital berhasil dihapus." });
      fetchStocks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (statusVal: string) => {
    switch (statusVal) {
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "SOLD":
        return "bg-muted text-muted-foreground border-border";
      case "RESERVED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "FAULTY":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-muted-foreground border-zinc-500/20";
    }
  };

  const getStatusLabel = (statusVal: string) => {
    switch (statusVal) {
      case "AVAILABLE": return "Tersedia";
      case "SOLD": return "Terjual";
      case "RESERVED": return "Dipesan";
      case "FAULTY": return "Bermasalah";
      default: return statusVal;
    }
  };

  useEffect(() => {
    if (actionMessage) {
      const t = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionMessage]);

  const filteredPackages = products.find((p) => p.id === selectedProductFilter)?.packages || [];

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

      {/* Control Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Kelola Persediaan Akun</h2>
          <p className="text-xs text-muted-foreground">Masukan data akun premium, key lisensi, link aktivasi, dan pantau status alokasi pembelian.</p>
        </div>
        <Button onClick={openAddDrawer} className="inline-flex items-center gap-1.5 self-start sm:self-center">
          <Plus size={16} /> Tambah Stok
        </Button>
      </div>

      {/* Filters Box */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 admin-card p-4">
        <div>
          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Filter Produk</label>
          <select
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500"
            value={selectedProductFilter}
            onChange={(e) => {
              setSelectedProductFilter(e.target.value);
              setSelectedPackageFilter("");
            }}
          >
            <option value="">Semua Produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Filter Varian</label>
          <select
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500"
            value={selectedPackageFilter}
            onChange={(e) => setSelectedPackageFilter(e.target.value)}
            disabled={!selectedProductFilter}
          >
            <option value="">Semua Varian</option>
            {filteredPackages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Filter Status</label>
          <select
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="AVAILABLE">Tersedia (Ready)</option>
            <option value="RESERVED">Dipesan (Pending)</option>
            <option value="SOLD">Terjual (Lunas)</option>
            <option value="FAULTY">Bermasalah (Faulty)</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat data stok...
          </div>
        ) : stocks.length === 0 ? (
          <div className="admin-empty-state">
            <Box size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Tidak ada stok digital ditemukan.</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs admin-table">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="p-4">Produk & Varian</th>
                    <th className="p-4">Tipe Kredensial</th>
                    <th className="p-4">Detail Data (Terlindungi)</th>
                    <th className="p-4">Masa Berlaku</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => {
                    const revealed = revealedIds[stock.id];
                    const isRevLoading = revealLoading[stock.id];
                    return (
                      <tr key={stock.id} className="group align-top">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <ProductLogo name={stock.package?.product?.name || "Unknown"} size="sm" />
                            <div>
                              <span className="font-bold text-foreground text-sm block">
                                {stock.package?.product?.name || "Produk Hilang"}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">{stock.package?.name || "Varian Hilang"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-muted-foreground">
                          {stock.type.replace("_", " ")}
                        </td>
                        <td className="p-4 space-y-1">
                          {stock.type === "EMAIL_PASSWORD" ? (
                            <div className="bg-card p-2 rounded-lg border border-border space-y-1 max-w-xs font-mono text-[10px]">
                              <p className="text-foreground">Email: {stock.email}</p>
                              <p className="text-muted-foreground flex items-center gap-1.5">
                                Pass: {revealed ? revealed.password : "••••••••"}
                                <button
                                  onClick={() => handleReveal(stock.id)}
                                  className="p-0.5 text-primary hover:text-primary transition cursor-pointer"
                                >
                                  {isRevLoading ? (
                                    <Loader2 className="animate-spin" size={10} />
                                  ) : revealed ? (
                                    <EyeOff size={10} />
                                  ) : (
                                    <Eye size={10} />
                                  )}
                                </button>
                              </p>
                              {stock.pin && (
                                <p className="text-muted-foreground">PIN: {revealed ? revealed.pin : "••••"}</p>
                              )}
                              {stock.profile && <p className="text-primary font-bold">Profil: {stock.profile}</p>}
                            </div>
                          ) : stock.type === "LICENSE_KEY" ? (
                            <div className="bg-card p-2 rounded-lg border border-border flex items-center justify-between gap-2 max-w-xs font-mono text-[10px]">
                              <span className="text-foreground truncate">
                                Code: {revealed ? revealed.code : "••••••••••••••••"}
                              </span>
                              <button
                                onClick={() => handleReveal(stock.id)}
                                className="p-1 text-primary hover:text-primary transition cursor-pointer"
                              >
                                {isRevLoading ? (
                                  <Loader2 className="animate-spin" size={10} />
                                ) : revealed ? (
                                  <EyeOff size={11} />
                                ) : (
                                  <Eye size={11} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="bg-card p-2 rounded-lg border border-border max-w-xs text-[10px]">
                              {stock.notes || "-"}
                            </div>
                          )}
                          {stock.notes && stock.type !== "MANUAL" && (
                            <p className="text-[9px] text-muted-foreground leading-normal italic">Catatan: {stock.notes}</p>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {stock.createdAt ? new Date(stock.createdAt).toLocaleDateString("id-ID") : "-"}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${getStatusBadge(stock.status)}`}>
                            {getStatusLabel(stock.status)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDetailStockId(stock.id)}
                              className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                              title="Detail Stok"
                            >
                              <Info size={12} />
                            </button>
                            <button
                              onClick={() => openEditDrawer(stock)}
                              className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(stock)}
                              className="p-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-white/5">
              {stocks.map((stock) => {
                const revealed = revealedIds[stock.id];
                const isRevLoading = revealLoading[stock.id];
                return (
                  <div key={stock.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <ProductLogo name={stock.package?.product?.name || "Unknown"} size="sm" />
                        <div>
                          <span className="font-bold text-foreground text-xs block">
                            {stock.package?.product?.name || "Produk Hilang"}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">{stock.package?.name || "Varian Hilang"}</span>
                        </div>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${getStatusBadge(stock.status)}`}>
                        {getStatusLabel(stock.status)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="text-[10px] font-semibold text-muted-foreground mb-1 block">Data Kredensial:</span>
                      {stock.type === "EMAIL_PASSWORD" ? (
                        <div className="bg-card p-2 rounded-lg border border-border space-y-1 font-mono text-[10px]">
                          <p className="text-foreground">Email: {stock.email}</p>
                          <p className="text-muted-foreground flex items-center justify-between">
                            <span>Pass: {revealed ? revealed.password : "••••••••"}</span>
                            <button
                              onClick={() => handleReveal(stock.id)}
                              className="p-1 text-primary hover:text-primary transition cursor-pointer bg-violet-500/10 rounded"
                            >
                              {isRevLoading ? (
                                <Loader2 className="animate-spin" size={10} />
                              ) : revealed ? (
                                <EyeOff size={10} />
                              ) : (
                                <Eye size={10} />
                              )}
                            </button>
                          </p>
                          {stock.pin && (
                            <p className="text-muted-foreground">PIN: {revealed ? revealed.pin : "••••"}</p>
                          )}
                          {stock.profile && <p className="text-primary font-bold">Profil: {stock.profile}</p>}
                        </div>
                      ) : stock.type === "LICENSE_KEY" ? (
                        <div className="bg-card p-2 rounded-lg border border-border flex items-center justify-between gap-2 font-mono text-[10px]">
                          <span className="text-foreground truncate">
                            Code: {revealed ? revealed.code : "••••••••••••••••"}
                          </span>
                          <button
                            onClick={() => handleReveal(stock.id)}
                            className="p-1 text-primary hover:text-primary transition cursor-pointer bg-violet-500/10 rounded"
                          >
                            {isRevLoading ? (
                              <Loader2 className="animate-spin" size={10} />
                            ) : revealed ? (
                              <EyeOff size={11} />
                            ) : (
                              <Eye size={11} />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-card p-2 rounded-lg border border-border text-[10px]">
                          {stock.notes || "-"}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-end mt-3">
                      <div>
                        <span className="text-[9px] text-muted-foreground block">Dibuat: {stock.createdAt ? new Date(stock.createdAt).toLocaleDateString("id-ID") : "-"}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 block">{stock.type.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDetailStockId(stock.id)}
                          className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                        >
                          <Info size={12} />
                        </button>
                        <button
                          onClick={() => openEditDrawer(stock)}
                          className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(stock)}
                          className="p-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Slide-over Form Drawer */}
      {drawerOpen && (
        <div className="admin-drawer-overlay">
          <div className="admin-drawer-panel p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <h3 className="text-base font-bold text-foreground">
                  {editingStock ? "Edit Persediaan Stok" : "Input Persediaan Baru"}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Pilih Paket Varian Produk</label>
                  <select
                    className="w-full rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-foreground outline-none ring-[var(--primary)] focus:ring-2"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                  >
                    {products.flatMap((prod) =>
                      prod.packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {prod.name} - {pkg.name} ({pkg.sku || "No SKU"})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Jenis Kredensial</label>
                    <select
                      className="w-full rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-foreground outline-none ring-[var(--primary)] focus:ring-2"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      disabled={!!editingStock}
                    >
                      <option value="EMAIL_PASSWORD">Email & Password</option>
                      <option value="LICENSE_KEY">Lisensi / Redeem Code</option>
                      <option value="ACTIVATION_LINK">Link Aktivasi</option>
                      <option value="MANUAL">Custom Manual (Teks Bebas)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status</label>
                    <select
                      className="w-full rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-foreground outline-none ring-[var(--primary)] focus:ring-2"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="AVAILABLE">Tersedia (Ready)</option>
                      <option value="SOLD">Terjual</option>
                      <option value="RESERVED">Dipesan</option>
                      <option value="FAULTY">Akun Bermasalah</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Adding Toggle */}
                {!editingStock && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="bulkToggle"
                      className="h-4 w-4 rounded border-border bg-muted text-violet-600 accent-violet-600"
                      checked={isBulk}
                      onChange={(e) => setIsBulk(e.target.checked)}
                    />
                    <label htmlFor="bulkToggle" className="text-xs font-bold text-primary select-none cursor-pointer">
                      Tambah Massal (Bulk Load)
                    </label>
                  </div>
                )}

                {/* Form dynamic inputs */}
                {isBulk ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block">Teks Massal (Satu Baris per Item)</label>
                      <div className="relative group cursor-pointer text-primary">
                        <HelpCircle size={14} />
                        <div className="absolute right-0 top-6 hidden group-hover:block bg-card border border-border p-3 rounded-lg w-64 shadow-xl z-50 text-[10px] text-muted-foreground font-sans leading-relaxed">
                          {type === "EMAIL_PASSWORD" ? (
                            <>
                              Format: <code className="text-primary">email|password|pin|profil|catatan</code><br />
                              Contoh: <code className="text-muted-foreground">user@mail.com|pass123|1221|Profil1|Grup A</code>
                            </>
                          ) : type === "LICENSE_KEY" ? (
                            <>
                              Format: <code className="text-primary">kodeLisensi|catatan</code><br />
                              Contoh: <code className="text-muted-foreground">ABCD-EFGH-IJKL|Aktifkan segera</code>
                            </>
                          ) : (
                            "Masukkan satu nilai text per baris."
                          )}
                        </div>
                      </div>
                    </div>
                    <textarea
                      required
                      className="w-full min-h-36 rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-xs text-foreground outline-none ring-[var(--primary)] placeholder:text-muted-foreground focus:ring-2 font-mono"
                      placeholder={
                        type === "EMAIL_PASSWORD"
                          ? "email1@test.com|password123|1122|ProfilA|notes1\nemail2@test.com|password456||ProfilB|"
                          : "LISENSI-CODE-1111-2222|notes\nLISENSI-CODE-3333-4444|"
                      }
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {type === "EMAIL_PASSWORD" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email Akun</label>
                            <Input required placeholder="alex@jstore.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Password Akun</label>
                            <Input
                              required={!editingStock}
                              placeholder={editingStock ? "Isi hanya untuk ubah password" : "••••••••"}
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">PIN Akun (Opsional)</label>
                            <Input placeholder="1212" value={pin} onChange={(e) => setPin(e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Profil Akun (Sharing)</label>
                            <Input placeholder="Layar 1 (Alex)" value={profile} onChange={(e) => setProfile(e.target.value)} />
                          </div>
                        </div>
                      </>
                    )}

                    {type === "LICENSE_KEY" && (
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Kode Lisensi (License Key)</label>
                        <Input required placeholder="XXXX-XXXX-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value)} />
                      </div>
                    )}

                    {type === "ACTIVATION_LINK" && (
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Link Aktivasi</label>
                        <Input required placeholder="https://activation-link.com/redeem?key=xxx" value={link} onChange={(e) => setLink(e.target.value)} />
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Catatan Tambahan (Terlihat Oleh Pembeli)</label>
                      <textarea
                        className="w-full min-h-16 rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-foreground outline-none ring-[var(--primary)] placeholder:text-muted-foreground focus:ring-2"
                        placeholder="Detail login atau instruksi khusus..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}

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

      {/* Stock Detail Drawer */}
      <StockDetailDrawer
        stockId={detailStockId}
        isOpen={!!detailStockId}
        onClose={() => setDetailStockId(null)}
        onUpdate={fetchStocks}
      />
    </div>
  );
}
