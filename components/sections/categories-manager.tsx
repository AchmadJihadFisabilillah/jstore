"use client";

import { useEffect, useState } from "react";
import { 
  Plus, Edit2, Trash2, Check, X, LayoutGrid, Loader2, FolderOpen,
  Tv, Headphones, Video, Sparkles, Laptop, Gamepad, Shield, BookOpen, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const iconMap = {
  Tv, Headphones, Video, Sparkles, Laptop, LayoutGrid, Gamepad, Shield, BookOpen, Gift
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

const AVAILABLE_ICONS = [
  "Tv",
  "Headphones",
  "Video",
  "Sparkles",
  "Laptop",
  "LayoutGrid",
  "Gamepad",
  "Shield",
  "BookOpen",
  "Gift",
];

const AVAILABLE_COLORS = [
  { name: "Violet", value: "violet", class: "bg-violet-500/10 text-primary border-violet-500/20" },
  { name: "Pink", value: "pink", class: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { name: "Blue", value: "blue", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { name: "Amber", value: "amber", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { name: "Emerald", value: "emerald", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { name: "Rose", value: "rose", class: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  { name: "Gray", value: "gray", class: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20" },
];

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("LayoutGrid");
  const [color, setColor] = useState("gray");
  const [order, setOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  
  const [formError, setFormError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddDrawer = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("LayoutGrid");
    setColor("gray");
    setOrder("0");
    setIsActive(true);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setIcon(cat.icon || "LayoutGrid");
    setColor(cat.color || "gray");
    setOrder(String(cat.order));
    setIsActive(cat.isActive);
    setFormError("");
    setDrawerOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitLoading(true);

    const payload = {
      name,
      slug,
      description,
      icon,
      color,
      order: Number(order) || 0,
      isActive,
    };

    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses kategori");
      }

      setActionMessage({
        type: "success",
        text: editingCategory ? "Kategori berhasil diperbarui!" : "Kategori baru berhasil ditambahkan!",
      });
      setDrawerOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
        );
        setActionMessage({ type: "success", text: `Kategori ${cat.name} telah diupdate.` });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus kategori");
      }

      setActionMessage({ type: "success", text: "Kategori berhasil dihapus." });
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Close notice automatically
  useEffect(() => {
    if (actionMessage) {
      const t = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionMessage]);

  const getColorClass = (colorVal: string | null) => {
    const matched = AVAILABLE_COLORS.find((c) => c.value === colorVal);
    return matched ? matched.class : "bg-zinc-500/10 text-muted-foreground border-zinc-500/20";
  };

  return (
    <div className="space-y-4">
      {/* Notice Banner */}
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
          <h2 className="text-lg font-bold text-foreground">Daftar Kategori</h2>
          <p className="text-xs text-muted-foreground">Pengelompokan produk digital untuk halaman etalase.</p>
        </div>
        <Button onClick={openAddDrawer} className="inline-flex items-center gap-1.5 self-start sm:self-center">
          <Plus size={16} /> Tambah Kategori
        </Button>
      </div>

      {/* Categories Table/List */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat data kategori...
          </div>
        ) : categories.length === 0 ? (
          <div className="admin-empty-state">
            <FolderOpen size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Kategori kosong. Buat kategori baru untuk memulai.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, index) => {
              const IconComponent = iconMap[cat.icon as keyof typeof iconMap] || iconMap.LayoutGrid;
              return (
                <div key={cat.id} className="admin-card p-4 flex flex-col sm:flex-row gap-6 items-start sm:items-center transition-all hover:border-violet-500/30">
                  {/* Left: Category Info */}
                  <div className="flex gap-4 flex-1 w-full sm:w-auto items-center">
                    <div className="relative shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-muted border border-border">
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                        {cat.order || index + 1}
                      </span>
                      <IconComponent size={20} className={`text-${cat.color}-400`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-foreground text-base truncate">{cat.name}</h3>
                      <span className="text-[10px] text-muted-foreground block font-mono mb-1">/{cat.slug}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{cat.description || "Tidak ada deskripsi"}</span>
                    </div>
                  </div>

                  {/* Middle: Stats & Visuals */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto shrink-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Visual</span>
                      <span className={`px-2 py-1 rounded-lg bg-${cat.color}-500/10 text-${cat.color}-400 border border-${cat.color}-500/20 text-[10px] font-semibold flex items-center gap-1.5 w-fit`}>
                        <IconComponent size={12} /> {cat.icon} ({cat.color})
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 sm:px-6 sm:border-l sm:border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Produk</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground text-sm">{cat._count?.products || 0}</span>
                        <span className="text-xs text-muted-foreground">items</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:px-6 sm:border-l sm:border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`admin-badge border text-[10px] px-2 py-0.5 w-fit cursor-pointer hover:opacity-80 transition-opacity ${
                          cat.isActive 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {cat.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 border-t border-border pt-4 sm:pt-0 sm:border-t-0">
                    <button
                      onClick={() => openEditDrawer(cat)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={14} /> <span className="text-xs sm:hidden">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 size={14} /> <span className="text-xs sm:hidden">Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar slide-over Form Drawer */}
      {drawerOpen && (
          <div className="admin-drawer-overlay">
          <div className="admin-drawer-panel p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <h3 className="text-base font-bold text-foreground">
                  {editingCategory ? "Edit Kategori" : "Kategori Baru"}
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
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nama Kategori</label>
                  <Input
                    required
                    placeholder="Contoh: Streaming Premium"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Slug URL Kategori</label>
                  <Input
                    required
                    placeholder="contoh-streaming-premium"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Deskripsi Singkat</label>
                  <textarea
                    className="w-full min-h-20 rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-foreground outline-none ring-[var(--primary)] placeholder:text-muted-foreground focus:ring-2"
                    placeholder="Jelaskan jenis produk digital dalam kategori ini..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Urutan Menu</label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  />
                </div>

                {/* Color Selection grid */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Pilih Warna Aksen</label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-center transition cursor-pointer ${
                          color === c.value
                            ? "bg-violet-600 border-violet-500 text-foreground"
                            : "bg-card border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Selection grid */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Pilih Ikon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVAILABLE_ICONS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(i)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                          icon === i
                            ? "bg-violet-600 border-violet-500 text-foreground"
                            : "bg-card border-border text-muted-foreground hover:text-foreground"
                        }`}
                        title={i}
                      >
                        <LayoutGrid size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Is Active Status checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    className="h-4 w-4 rounded border-border bg-muted text-violet-600 accent-violet-600 focus:ring-violet-500 cursor-pointer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-semibold text-foreground select-none cursor-pointer">
                    Aktifkan kategori ini agar terlihat di Toko
                  </label>
                </div>

                {formError && <p className="text-xs text-red-500 font-semibold">{formError}</p>}
              </form>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
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
