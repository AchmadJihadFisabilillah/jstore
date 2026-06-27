"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, ShoppingBag, Loader2, Sparkles, Flame, Star, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductLogo } from "@/components/admin";
import { ProductForm, ProductInput } from "@/components/admin/product-form";

interface Package {
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
  _count?: {
    digitalStocks: number;
  };
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string | null;
  category: string | null;
  categoryRel: Category | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  shortDesc: string | null;
  usageGuide: string | null;
  terms: string | null;
  isActive: boolean;
  isRecommended: boolean;
  isBestseller: boolean;
  isNew: boolean;
  order: number;
  seoTitle: string | null;
  seoDescription: string | null;
  
  brandColor: string | null;
  logoBackground: string | null;
  activationType: string | null;
  processingType: string | null;
  warrantyDuration: string | null;

  packages: Package[];
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formError, setFormError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);

      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(prodData);
        setCategories(catData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDrawer = () => {
    setEditingProduct(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (prod: Product) => {
    setEditingProduct(prod);
    setDrawerOpen(true);
  };

  const handleSaveProduct = async (payload: ProductInput) => {
    setFormError("");
    setSubmitLoading(true);

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses produk");
      }

      setActionMessage({
        type: "success",
        text: editingProduct ? "Produk berhasil diperbarui!" : "Produk baru berhasil ditambahkan!",
      });
      setDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      throw new Error(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (prod: Product) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${prod.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus produk");
      }

      setActionMessage({ type: "success", text: "Produk berhasil dihapus." });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const calculateMargin = (price: number, costPrice: number) => {
    if (price <= 0) return 0;
    return ((price - costPrice) / price) * 100;
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
          <h2 className="text-lg font-bold text-foreground">Daftar Produk & Varian</h2>
          <p className="text-xs text-muted-foreground">Kelola informasi produk digital, SEO metadata, petunjuk pakai, dan varian harga.</p>
        </div>
        <Button onClick={openAddDrawer} className="inline-flex items-center gap-1.5 self-start sm:self-center">
          <Plus size={16} /> Tambah Produk
        </Button>
      </div>

      {/* Products Table/List */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat data produk...
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty-state">
            <Sparkles size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Produk kosong. Silakan tambah produk baru.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((prod) => (
              <div key={prod.id} className="admin-card p-4 flex flex-col lg:flex-row gap-6 items-start transition-all hover:border-violet-500/30">
                {/* Left: Product Info */}
                <div className="flex gap-4 flex-1 w-full lg:w-auto">
                  <div className="relative shrink-0">
                    <ProductLogo name={prod.name} size="lg" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      {prod.order}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground text-base truncate">{prod.name}</h3>
                      <span
                        className={`admin-badge border px-1.5 py-0.5 text-[9px] ${
                          prod.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-zinc-500/10 text-muted-foreground border-zinc-500/20"
                        }`}
                      >
                        {prod.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1 mb-2">{prod.shortDesc || "No short description"}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                        {prod.categoryRel?.name || prod.category || "Lainnya"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prod.isNew && (
                          <span className="admin-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Sparkles size={10} /> Baru
                          </span>
                        )}
                        {prod.isBestseller && (
                          <span className="admin-badge bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <Flame size={10} /> Terpopuler
                          </span>
                        )}
                        {prod.isRecommended && (
                          <span className="admin-badge bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Star size={10} /> Rekomendasi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Variants List */}
                <div className="w-full lg:w-[400px] shrink-0">
                  <div className="space-y-1.5">
                    {prod.packages.map((pkg, idx) => {
                      const margin = calculateMargin(pkg.price, pkg.costPrice);
                      return (
                        <div key={idx} className="bg-card p-2.5 rounded-xl border border-border flex items-center justify-between text-[11px] group-hover/pkg:border-border transition-colors">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-foreground truncate block text-xs">{pkg.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">SKU: {pkg.sku || "-"}</span>
                          </div>
                          <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-1">
                            <span className="font-bold text-foreground text-xs">{formatIDR(pkg.price)}</span>
                            <span
                              className={`admin-badge border text-[9px] px-1.5 py-0.5 ${
                                margin >= 50
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : margin >= 20
                                  ? "bg-violet-500/10 text-primary border-violet-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}
                              title={`Harga Beli: ${formatIDR(pkg.costPrice)}`}
                            >
                              Margin: {margin.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {prod.packages.length === 0 && (
                      <div className="text-center p-3 border border-dashed border-border rounded-xl text-muted-foreground italic text-[11px]">
                        Belum ada varian produk.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex lg:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openEditDrawer(prod)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                    title="Edit Produk"
                  >
                    <Edit2 size={14} /> <span className="text-xs lg:hidden">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(prod)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                    title="Hapus Produk"
                  >
                    <Trash2 size={14} /> <span className="text-xs lg:hidden">Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Form Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl h-full border-l border-border bg-[#08080c] shadow-2xl flex flex-col animate-in slide-in-from-right duration-350">
            <ProductForm
              initialData={editingProduct ? {
                id: editingProduct.id,
                name: editingProduct.name,
                description: editingProduct.description,
                categoryId: editingProduct.categoryId || "",
                logoUrl: editingProduct.logoUrl || "",
                bannerUrl: editingProduct.bannerUrl || "",
                shortDesc: editingProduct.shortDesc || "",
                usageGuide: editingProduct.usageGuide || "",
                terms: editingProduct.terms || "",
                isActive: editingProduct.isActive,
                isRecommended: editingProduct.isRecommended,
                isBestseller: editingProduct.isBestseller,
                isNew: editingProduct.isNew,
                order: editingProduct.order,
                seoTitle: editingProduct.seoTitle || "",
                seoDescription: editingProduct.seoDescription || "",
                brandColor: editingProduct.brandColor || "",
                logoBackground: editingProduct.logoBackground || "",
                activationType: editingProduct.activationType || "Otomatis",
                processingType: editingProduct.processingType || "Instan",
                warrantyDuration: editingProduct.warrantyDuration || "Sesuai Durasi",
                packages: editingProduct.packages.map(p => ({
                  id: p.id,
                  name: p.name,
                  duration: p.duration,
                  price: p.price,
                  costPrice: p.costPrice,
                  originalPrice: p.originalPrice,
                  discount: p.discount,
                  warranty: p.warranty,
                  description: p.description,
                  sku: p.sku,
                  isActive: p.isActive,
                  order: p.order,
                  stockStatus: p.stockStatus
                }))
              } : undefined}
              categories={categories}
              onSave={handleSaveProduct}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
