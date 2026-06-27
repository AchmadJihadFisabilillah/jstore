"use client";

import { useState, useEffect } from "react";
import { Check, X, Plus, Trash2, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface PackageInput {
  id?: string;
  name: string;
  duration: number;
  price: number;
  costPrice: number;
  originalPrice: number;
  discount: number;
  warranty: string;
  description: string;
  sku: string;
  isActive: boolean;
  order: number;
  stockStatus?: string;
}

export interface ProductInput {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  logoUrl: string;
  bannerUrl: string;
  shortDesc: string;
  usageGuide: string;
  terms: string;
  isActive: boolean;
  isRecommended: boolean;
  isBestseller: boolean;
  isNew: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
  
  brandColor: string;
  logoBackground: string;
  activationType: string;
  processingType: string;
  warrantyDuration: string;

  packages: PackageInput[];
}

interface ProductFormProps {
  initialData?: ProductInput;
  categories: { id: string; name: string }[];
  onSave: (data: ProductInput) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initialData, categories, onSave, onCancel }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "packages" | "settings">("general");
  const [formData, setFormData] = useState<ProductInput>(() => ({
    name: initialData?.name || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    logoUrl: initialData?.logoUrl || "",
    bannerUrl: initialData?.bannerUrl || "",
    shortDesc: initialData?.shortDesc || "",
    usageGuide: initialData?.usageGuide || "",
    terms: initialData?.terms || "",
    isActive: initialData?.isActive ?? true,
    isRecommended: initialData?.isRecommended || false,
    isBestseller: initialData?.isBestseller || false,
    isNew: initialData?.isNew || false,
    order: initialData?.order || 0,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    brandColor: initialData?.brandColor || "",
    logoBackground: initialData?.logoBackground || "",
    activationType: initialData?.activationType || "Otomatis",
    processingType: initialData?.processingType || "Instan",
    warrantyDuration: initialData?.warrantyDuration || "Sesuai Durasi",
    packages: initialData?.packages ? JSON.parse(JSON.stringify(initialData.packages)) : [],
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const updateField = (key: keyof ProductInput, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePackageChange = (index: number, key: keyof PackageInput, val: any) => {
    const newPkgs = [...formData.packages];
    newPkgs[index] = { ...newPkgs[index], [key]: val };

    if (key === "price" || key === "originalPrice") {
      const priceNum = key === "price" ? Number(val) : newPkgs[index].price;
      const origNum = key === "originalPrice" ? Number(val) : newPkgs[index].originalPrice;
      if (origNum > 0 && priceNum < origNum) {
        newPkgs[index].discount = Math.round(((origNum - priceNum) / origNum) * 100);
      } else {
        newPkgs[index].discount = 0;
      }
    }
    updateField("packages", newPkgs);
  };

  const handleAddPackage = () => {
    updateField("packages", [
      ...formData.packages,
      {
        name: "",
        duration: 30,
        price: 0,
        costPrice: 0,
        originalPrice: 0,
        discount: 0,
        warranty: "30 Hari",
        description: "",
        sku: "",
        isActive: true,
        order: formData.packages.length,
        stockStatus: "Tersedia",
      }
    ]);
  };

  const validate = (): boolean => {
    if (!formData.name) {
      setError("Nama produk wajib diisi.");
      setActiveTab("general");
      return false;
    }
    if (!formData.categoryId) {
      setError("Kategori wajib dipilih.");
      setActiveTab("general");
      return false;
    }
    if (formData.packages.length > 0) {
      for (const pkg of formData.packages) {
        if (!pkg.name || pkg.price < 0) {
          setError(`Paket "${pkg.name || 'Tanpa Nama'}" memiliki data tidak valid (Harga < 0 atau nama kosong).`);
          setActiveTab("packages");
          return false;
        }
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "general", label: "Informasi Umum" },
    { id: "branding", label: "Tampilan & Proses" },
    { id: "packages", label: `Varian Paket (${formData.packages.length})` },
    { id: "settings", label: "Pengaturan & SEO" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#08080c] text-foreground">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <h3 className="text-lg font-bold">
          {initialData?.id ? "Edit Produk" : "Tambah Produk Baru"}
        </h3>
        <button onClick={onCancel} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 border-b border-border shrink-0 overflow-x-auto custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id 
                ? "border-violet-500 text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* TAB: GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Nama Produk *</label>
                <Input value={formData.name} onChange={e => updateField("name", e.target.value)} placeholder="Contoh: Netflix Premium" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Kategori *</label>
                <select
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:border-violet-500"
                  value={formData.categoryId}
                  onChange={e => updateField("categoryId", e.target.value)}
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Deskripsi Singkat (Katalog)</label>
              <Input value={formData.shortDesc} onChange={e => updateField("shortDesc", e.target.value)} placeholder="Tampil di card katalog..." />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Deskripsi Lengkap (Halaman Detail)</label>
              <textarea
                className="w-full min-h-[120px] rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 custom-scrollbar"
                value={formData.description}
                onChange={e => updateField("description", e.target.value)}
                placeholder="Penjelasan lengkap mengenai fitur, keunggulan, dll."
              />
            </div>
          </div>
        )}

        {/* TAB: BRANDING */}
        {activeTab === "branding" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">URL Logo / Ikon</label>
                <Input value={formData.logoUrl} onChange={e => updateField("logoUrl", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Warna Brand (HEX)</label>
                <div className="flex gap-3">
                  <Input type="color" value={formData.brandColor || "#8B5CF6"} onChange={e => updateField("brandColor", e.target.value)} className="w-12 p-1" />
                  <Input value={formData.brandColor} onChange={e => updateField("brandColor", e.target.value)} placeholder="#8B5CF6" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Tipe Aktivasi</label>
                <select
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-violet-500"
                  value={formData.activationType}
                  onChange={e => updateField("activationType", e.target.value)}
                >
                  <option value="Otomatis">Otomatis</option>
                  <option value="Manual">Manual</option>
                  <option value="Butuh Data User">Butuh Data User</option>
                  <option value="Invite Email">Invite Email</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Estimasi Proses</label>
                <select
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-violet-500"
                  value={formData.processingType}
                  onChange={e => updateField("processingType", e.target.value)}
                >
                  <option value="Instan">Instan (Otomatis)</option>
                  <option value="5-15 Menit">5-15 Menit</option>
                  <option value="1-24 Jam">1-24 Jam</option>
                  <option value="Manual">Manual by Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Durasi Garansi</label>
                <Input value={formData.warrantyDuration} onChange={e => updateField("warrantyDuration", e.target.value)} placeholder="Sesuai Durasi / 30 Hari" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Cara Penggunaan / Panduan Aktivasi</label>
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-violet-500"
                value={formData.usageGuide}
                onChange={e => updateField("usageGuide", e.target.value)}
                placeholder="Instruksi yang didapat user setelah bayar..."
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Syarat & Ketentuan (Tampil di Accordion)</label>
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-violet-500"
                value={formData.terms}
                onChange={e => updateField("terms", e.target.value)}
                placeholder="Aturan garansi hangus, larangan ganti password, dll."
              />
            </div>
          </div>
        )}

        {/* TAB: PACKAGES */}
        {activeTab === "packages" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-foreground">Varian Harga & Durasi</h4>
                <p className="text-xs text-muted-foreground mt-1">Tambahkan paket yang bisa dipilih oleh pelanggan.</p>
              </div>
              <button onClick={handleAddPackage} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-foreground text-sm font-bold rounded-xl flex items-center gap-2">
                <Plus size={16} /> Tambah Paket
              </button>
            </div>

            {formData.packages.length === 0 ? (
              <div className="py-12 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-muted">
                <p className="text-muted-foreground text-sm">Belum ada paket/varian yang ditambahkan.</p>
                <button onClick={handleAddPackage} className="mt-4 px-4 py-2 bg-muted hover:bg-white/20 rounded-xl text-xs font-bold text-foreground">
                  Buat Paket Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.packages.map((pkg, idx) => (
                  <div key={idx} className="border border-border bg-card p-5 rounded-2xl relative group">
                    <button 
                      onClick={() => {
                        const newPkgs = [...formData.packages];
                        newPkgs.splice(idx, 1);
                        updateField("packages", newPkgs);
                      }}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                      <div className="md:col-span-5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Nama Paket</label>
                        <Input value={pkg.name} onChange={e => handlePackageChange(idx, "name", e.target.value)} placeholder="Contoh: Sharing 1 Bulan" className="h-9 text-sm" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">SKU Code</label>
                        <Input value={pkg.sku} onChange={e => handlePackageChange(idx, "sku", e.target.value)} placeholder="NF-SH-1M" className="h-9 text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Durasi (Hari)</label>
                        <Input type="number" value={pkg.duration} onChange={e => handlePackageChange(idx, "duration", Number(e.target.value))} className="h-9 text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Status</label>
                        <select 
                          className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm focus:border-violet-500 h-9"
                          value={pkg.stockStatus || "Tersedia"}
                          onChange={e => handlePackageChange(idx, "stockStatus", e.target.value)}
                        >
                          <option value="Tersedia">Tersedia</option>
                          <option value="Habis">Habis</option>
                          <option value="Stok Menipis">Menipis</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Harga Modal (Rp)</label>
                        <Input type="number" value={pkg.costPrice} onChange={e => handlePackageChange(idx, "costPrice", Number(e.target.value))} className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Harga Coret (Rp)</label>
                        <Input type="number" value={pkg.originalPrice} onChange={e => handlePackageChange(idx, "originalPrice", Number(e.target.value))} className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1 block">Harga Jual (Rp)</label>
                        <Input type="number" value={pkg.price} onChange={e => handlePackageChange(idx, "price", Number(e.target.value))} className="h-9 text-sm border-violet-500/30 bg-violet-500/5" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Diskon (%) - Otomatis</label>
                        <Input type="number" readOnly value={pkg.discount} className="h-9 text-sm bg-background/40 text-muted-foreground" />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4">Visibilitas & Promosi</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-border">
                  <input type="checkbox" checked={formData.isActive} onChange={e => updateField("isActive", e.target.checked)} className="h-5 w-5 rounded border-border accent-violet-600 bg-muted" />
                  <div>
                    <div className="font-bold text-sm text-foreground">Produk Aktif</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Tampilkan produk di katalog publik</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-border">
                  <input type="checkbox" checked={formData.isNew} onChange={e => updateField("isNew", e.target.checked)} className="h-5 w-5 rounded border-border accent-blue-600 bg-muted" />
                  <div>
                    <div className="font-bold text-sm text-foreground">Label "Baru"</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Berikan badge Baru di katalog</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-border">
                  <input type="checkbox" checked={formData.isBestseller} onChange={e => updateField("isBestseller", e.target.checked)} className="h-5 w-5 rounded border-border accent-fuchsia-600 bg-muted" />
                  <div>
                    <div className="font-bold text-sm text-foreground">Label "Terlaris"</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Sorot sebagai produk paling diminati</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-border">
                  <input type="checkbox" checked={formData.isRecommended} onChange={e => updateField("isRecommended", e.target.checked)} className="h-5 w-5 rounded border-border accent-amber-500 bg-muted" />
                  <div>
                    <div className="font-bold text-sm text-foreground">Rekomendasi</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Tampilkan di slider utama/rekomendasi</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Urutan Tampil (Order)</label>
              <Input type="number" value={formData.order} onChange={e => updateField("order", Number(e.target.value))} className="max-w-[200px]" />
              <p className="text-[10px] text-muted-foreground mt-1">Angka lebih tinggi akan tampil lebih awal jika diurutkan berdasarkan Order.</p>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-4">Metadata SEO</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Meta Title</label>
                  <Input value={formData.seoTitle} onChange={e => updateField("seoTitle", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Meta Description</label>
                  <Input value={formData.seoDescription} onChange={e => updateField("seoDescription", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-6 border-t border-border shrink-0 bg-background/40 flex justify-between items-center">
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold hover:text-foreground hover:bg-muted transition text-sm"
        >
          {showPreview ? "Tutup Preview" : "Live Preview"}
        </button>

        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold hover:text-foreground hover:bg-muted transition text-sm"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-foreground font-bold transition shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 text-sm flex items-center gap-2"
          >
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Check size={16} />}
            Simpan Produk
          </button>
        </div>
      </div>
    </div>
  );
}
