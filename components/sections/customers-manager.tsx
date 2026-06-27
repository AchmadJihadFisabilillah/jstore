"use client";

import { useEffect, useState } from "react";
import { Users, Search, X, Loader2, Ban, CheckCircle, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Customer {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  ordersCount: number;
  totalSpend: number;
}

interface OrderHistoryItem {
  id: string;
  invoiceNo: string | null;
  status: string;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  package: {
    name: string;
    price: number;
    product: {
      name: string;
    };
  };
}

export function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<{ name: string; email: string; orders: OrderHistoryItem[] } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const [submitLoading, setSubmitLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerDetails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenDetail = (id: string) => {
    setSelectedCustomerId(id);
    fetchCustomerDetails(id);
  };

  const handleToggleBlock = async (cust: Customer) => {
    const nextState = !cust.isActive;
    const actionText = nextState ? "mengaktifkan kembali" : "memblokir";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} pelanggan "${cust.name}"?`)) return;

    const id = cust.id;
    setSubmitLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Akun ${cust.name} berhasil ${nextState ? "diaktifkan" : "diblokir"}.`,
        });
        
        // Update local state
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: nextState } : c))
        );
      } else {
        const data = await res.json();
        alert(data.message || "Gagal mengubah status akun.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Filter clients based on search query
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {message.text}
        </div>
      )}

      {/* Search Filter */}
      <div className="flex admin-card p-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari Nama Pelanggan atau Email..."
            className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat data pelanggan...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Tidak ada pelanggan ditemukan.</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs admin-table">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="p-4">Nama Pelanggan</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Terdaftar</th>
                    <th className="p-4 text-center">Pesanan</th>
                    <th className="p-4 text-right">Total Transaksi</th>
                    <th className="p-4 text-center">Status Akun</th>
                    <th className="p-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="group align-top">
                      <td className="p-4 font-bold text-foreground text-sm">{cust.name}</td>
                      <td className="p-4 font-mono text-muted-foreground">{cust.email}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(cust.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4 text-center font-bold text-muted-foreground">{cust.ordersCount}</td>
                      <td className="p-4 text-right font-bold text-primary">{formatIDR(cust.totalSpend)}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            cust.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {cust.isActive ? "Aktif" : "Diblokir"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(cust.id)}
                            className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                            title="Detail Profil & Riwayat"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => handleToggleBlock(cust)}
                            disabled={submitLoading[cust.id]}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              cust.isActive
                                ? "border-rose-950/20 bg-card hover:bg-rose-950/40 text-rose-400 hover:text-rose-300"
                                : "border-emerald-950/20 bg-card hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300"
                            }`}
                            title={cust.isActive ? "Blokir Pelanggan" : "Aktifkan Akun"}
                          >
                            {submitLoading[cust.id] ? (
                              <Loader2 className="animate-spin" size={12} />
                            ) : cust.isActive ? (
                              <Ban size={12} />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-white/5">
              {filteredCustomers.map((cust) => (
                <div key={cust.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-foreground text-sm">{cust.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">{cust.email}</div>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${
                        cust.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {cust.isActive ? "Aktif" : "Diblokir"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                    <div className="bg-muted p-2 rounded-lg border border-white/[0.02]">
                      <span className="text-muted-foreground block mb-0.5">Total Transaksi</span>
                      <span className="font-bold text-primary">{formatIDR(cust.totalSpend)}</span>
                    </div>
                    <div className="bg-muted p-2 rounded-lg border border-white/[0.02]">
                      <span className="text-muted-foreground block mb-0.5">Jumlah Pesanan</span>
                      <span className="font-bold text-muted-foreground">{cust.ordersCount} pesanan</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground block">
                      Terdaftar: {new Date(cust.createdAt).toLocaleDateString("id-ID")}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(cust.id)}
                        className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                        title="Detail Profil & Riwayat"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(cust)}
                        disabled={submitLoading[cust.id]}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          cust.isActive
                            ? "border-rose-950/20 bg-card hover:bg-rose-950/40 text-rose-400 hover:text-rose-300"
                            : "border-emerald-950/20 bg-card hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300"
                        }`}
                        title={cust.isActive ? "Blokir Pelanggan" : "Aktifkan Akun"}
                      >
                        {submitLoading[cust.id] ? (
                          <Loader2 className="animate-spin" size={12} />
                        ) : cust.isActive ? (
                          <Ban size={12} />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details Slide-over Drawer */}
      {selectedCustomerId && (
        <div className="admin-drawer-overlay">
          <div className="admin-drawer-panel p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users size={18} className="text-primary" /> Profil & Riwayat Belanja
                </h3>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {detailsLoading || !customerDetails ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="animate-spin text-primary mr-2" size={16} /> Memuat riwayat pembelian...
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  {/* Profil header */}
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <p className="text-sm font-bold text-foreground">{customerDetails.name}</p>
                    <p className="text-muted-foreground font-mono mt-0.5">{customerDetails.email}</p>
                  </div>

                  {/* Transaction log list */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-primary flex items-center gap-1">
                      <ShoppingCart size={13} /> Log Pembelian ({customerDetails.orders.length})
                    </h4>
                    
                    <div className="space-y-2 max-h-[30rem] overflow-y-auto pr-1 custom-scrollbar">
                      {customerDetails.orders.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground italic">Pelanggan belum pernah bertransaksi.</p>
                      ) : (
                        customerDetails.orders.map((o) => (
                          <div key={o.id} className="p-3 bg-card rounded-xl border border-border space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">{o.invoiceNo || "Order Pending"}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                  o.status === "PAID"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-zinc-850 text-muted-foreground border-border"
                                }`}
                              >
                                {o.status}
                              </span>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-foreground">{o.package.product.name} - {o.package.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Tanggal: {new Date(o.createdAt).toLocaleDateString("id-ID")} • Harga: {formatIDR(o.package.price)}
                              </p>
                            </div>

                            {o.status === "PAID" && o.startDate && o.endDate && (
                              <div className="pt-2 border-t border-border text-[9px] text-muted-foreground flex justify-between">
                                <span>Aktivasi: {new Date(o.startDate).toLocaleDateString("id-ID")}</span>
                                <span>Habis: {new Date(o.endDate).toLocaleDateString("id-ID")}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="w-full bg-muted hover:bg-muted text-foreground font-semibold py-2 rounded-xl"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
