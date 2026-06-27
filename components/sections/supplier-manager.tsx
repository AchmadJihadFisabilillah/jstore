"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Truck, Mail, Phone, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Supplier {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
  joinedAt: string;
  _count?: { stocks: number };
}

export function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    notes: "",
  });
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/suppliers?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchSuppliers();
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  const openAdd = () => {
    setEditingSupplier(null);
    setForm({ name: "", whatsapp: "", email: "", notes: "" });
    setErrorMsg("");
    setDrawerOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      whatsapp: s.whatsapp || "",
      email: s.email || "",
      notes: s.notes || "",
    });
    setErrorMsg("");
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg("");

    try {
      const url = editingSupplier ? `/api/admin/suppliers/${editingSupplier.id}` : `/api/admin/suppliers`;
      const method = editingSupplier ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menyimpan supplier");
      } else {
        setDrawerOpen(false);
        fetchSuppliers();
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus supplier ini? Semua stok dari supplier ini mungkin akan terpengaruh jika tidak direassign.")) return;
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSuppliers();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus supplier");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input 
          placeholder="Cari nama / email supplier..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-muted border-border text-foreground"
        />
        <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-foreground shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.3)] cursor-pointer">
          <Plus size={16} className="mr-2" />
          Tambah Supplier
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="animate-spin mb-2" size={24} />
          <p className="text-sm">Memuat data supplier...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground bg-muted rounded-xl border border-border border-dashed">
          <Truck className="mx-auto mb-3 opacity-20" size={40} />
          <p>Belum ada supplier yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-4 hover:border-violet-500/30 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-foreground text-lg">{s.name}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="p-1.5 bg-muted hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-md text-rose-400 cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} />
                  <span>{s.whatsapp || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} />
                  <span className="truncate">{s.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <ShoppingBag size={14} />
                  <span>{s._count?.stocks || 0} Stok Terdaftar</span>
                </div>
                {s.notes && (
                  <div className="mt-3 p-2 bg-muted rounded-lg text-xs text-muted-foreground border border-border line-clamp-2">
                    {s.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted">
              <h2 className="text-lg font-bold text-foreground">{editingSupplier ? "Edit Supplier" : "Tambah Supplier Baru"}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Nama Supplier <span className="text-rose-500">*</span></label>
                <Input 
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="bg-muted border-border text-foreground"
                  placeholder="Misal: Netflix Official, Reseller B"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">WhatsApp</label>
                <Input 
                  value={form.whatsapp}
                  onChange={e => setForm({...form, whatsapp: e.target.value})}
                  className="bg-muted border-border text-foreground"
                  placeholder="08123456789"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email</label>
                <Input 
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="bg-muted border-border text-foreground"
                  placeholder="admin@supplier.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Catatan Internal</label>
                <textarea 
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full h-24 bg-muted border-border text-foreground rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Nomor rekening, kesepakatan harga, dll..."
                />
              </div>

              <Button disabled={submitLoading} className="w-full bg-violet-600 hover:bg-violet-700 text-foreground font-semibold cursor-pointer">
                {submitLoading ? <Loader2 className="animate-spin" size={16} /> : "Simpan Supplier"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
