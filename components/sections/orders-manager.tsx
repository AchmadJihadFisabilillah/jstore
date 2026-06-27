"use client";

import { useEffect, useState } from "react";
import { Receipt, Search, Eye, X, Loader2, Check, AlertCircle, AlertTriangle, Send, ShoppingBag, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StockTakeModal, ProductLogo } from "@/components/admin";

interface Order {
  id: string;
  userId: string;
  packageId: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  invoiceNo: string | null;
  whatsapp: string | null;
  paymentProof: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  user: {
    name: string;
    email: string;
  };
  package: {
    id: string;
    name: string;
    price: number;
    sku: string | null;
    product: {
      name: string;
    };
  };
  digitalStock: {
    id: string;
    type: string;
    email: string | null;
    notes: string | null;
    status: string;
  } | null;
}

interface AvailableStock {
  id: string;
  type: string;
  email: string | null;
  code: string | null;
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Assign Stock states
  const [availableStocks, setAvailableStocks] = useState<AvailableStock[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [manualStockText, setManualStockText] = useState("");
  const [adminNotesText, setAdminNotesText] = useState("");
  const [rejectReasonText, setRejectReasonText] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [takeModalOpen, setTakeModalOpen] = useState(false);
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = "?";
      if (statusFilter) query += `status=${statusFilter}&`;
      if (searchQuery) query += `search=${searchQuery}&`;
      const res = await fetch(`/api/admin/orders${query}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchQuery]);

  const fetchAvailableStocksForPackage = async (packageId: string) => {
    setStocksLoading(true);
    try {
      const res = await fetch(`/api/admin/stock?packageId=${packageId}&status=AVAILABLE`);
      if (res.ok) {
        const data = await res.json();
        setAvailableStocks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStocksLoading(false);
    }
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setAdminNotesText(order.adminNotes || "");
    setRejectReasonText(order.rejectionReason || "");
    setManualStockText("");
    setShowRejectForm(false);
    
    if (order.status === "PAID" && !order.digitalStock) {
      fetchAvailableStocksForPackage(order.packageId);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setSubmitLoading(true);
    try {
      const payload: any = { status: newStatus };
      if (newStatus === "PENDING" && rejectReasonText) {
        payload.rejectionReason = rejectReasonText;
      }
      
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: `Order status updated to ${newStatus}` });
        setSelectedOrder(null);
        fetchOrders();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: adminNotesText }),
      });
      if (res.ok) {
        setActionMessage({ type: "success", text: "Catatan admin berhasil disimpan." });
        setSelectedOrder({ ...selectedOrder, adminNotes: adminNotesText });
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignStock = async (stockId: string) => {
    if (!selectedOrder) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign_stock", digitalStockId: stockId }),
      });
      if (res.ok) {
        setActionMessage({ type: "success", text: "Stok digital berhasil dikaitkan!" });
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal mengaitkan stok");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeliverManualStock = async () => {
    if (!selectedOrder || !manualStockText) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deliver_manual", manualData: manualStockText }),
      });
      if (res.ok) {
        setActionMessage({ type: "success", text: "Stok manual berhasil dikirim!" });
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal mengirim stok manual");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
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
        <div className={`p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
          {actionMessage.text}
        </div>
      )}

      {/* Filters Box */}
      <div className="flex flex-col sm:flex-row gap-3 admin-card p-4 justify-between">
        <div className="flex flex-1 gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari Invoice, Nama, atau Email..."
              className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/30 transition-all admin-input placeholder:text-zinc-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500 admin-select admin-input transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PAID">Lunas (Paid)</option>
            <option value="EXPIRED">Kadaluarsa</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat data transaksi...
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <ShoppingBag size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Tidak ada transaksi ditemukan.</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs admin-table">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="p-4">Invoice / Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Produk & Varian</th>
                    <th className="p-4">Total Bayar</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Stok</th>
                    <th className="p-4 text-center w-20">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="align-top group">
                      <td className="p-4">
                        <span className="font-bold text-foreground block">{o.invoiceNo || "N/A"}</span>
                        <span className="text-[9px] text-muted-foreground block">
                          {new Date(o.createdAt).toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-muted-foreground block">{o.user.name}</span>
                        <span className="text-[10px] text-muted-foreground block font-mono">{o.user.email}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ProductLogo name={o.package.product.name} size="sm" />
                          <div>
                            <span className="text-foreground font-semibold block">{o.package.product.name}</span>
                            <span className="text-[10px] text-muted-foreground block">{o.package.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {formatIDR(o.package.price)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            o.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : o.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {o.status === "PAID" ? "Lunas" : o.status === "PENDING" ? "Menunggu" : "Kadaluarsa"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {o.status === "PAID" ? (
                          o.digitalStock ? (
                            <span className="text-[10px] font-bold text-emerald-400">Terkirim</span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-400 inline-flex items-center gap-0.5">
                              <AlertCircle size={10} /> Kosong
                            </span>
                          )
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenDetail(o)}
                          className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-white/5">
              {orders.map((o) => (
                <div key={o.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <ProductLogo name={o.package.product.name} size="sm" />
                      <div>
                        <span className="text-foreground font-semibold block text-xs">{o.package.product.name}</span>
                        <span className="text-[10px] text-muted-foreground block">{o.package.name}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${
                        o.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : o.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {o.status === "PAID" ? "Lunas" : o.status === "PENDING" ? "Menunggu" : "Kadaluarsa"}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-end">
                    <div>
                      <span className="font-bold text-foreground block text-xs">{o.invoiceNo || "N/A"}</span>
                      <span className="text-[10px] text-muted-foreground block">{o.user.name}</span>
                      <span className="text-[9px] text-muted-foreground block">
                        {new Date(o.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground text-xs mb-1">{formatIDR(o.package.price)}</div>
                      <button
                        onClick={() => handleOpenDetail(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer text-[10px] font-semibold"
                      >
                        <Eye size={12} /> Detail
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
      {selectedOrder && (
        <div className="admin-drawer-overlay">
          <div className="admin-drawer-panel p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Receipt size={18} className="text-primary" /> Detail Transaksi
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Order Info Details Grid */}
              <div className="space-y-5 text-xs">
                {/* Status Indicator */}
                <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Invoice</p>
                    <p className="text-sm font-extrabold text-foreground">{selectedOrder.invoiceNo || "N/A"}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-extrabold border ${
                      selectedOrder.status === "PAID"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : selectedOrder.status === "PENDING"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">Pelanggan</h4>
                  <div className="grid grid-cols-2 gap-2 bg-[#09090e]/60 p-3 rounded-xl border border-border">
                    <div>
                      <p className="text-muted-foreground">Nama</p>
                      <p className="font-bold text-foreground">{selectedOrder.user.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-bold text-muted-foreground font-mono">{selectedOrder.user.email}</p>
                    </div>
                    {selectedOrder.whatsapp && (
                      <div className="col-span-2 mt-1">
                        <p className="text-muted-foreground">WhatsApp</p>
                        <p className="font-bold text-emerald-400">{selectedOrder.whatsapp}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Purchase Items */}
                <div>
                  <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">Produk & Varian</h4>
                  <div className="bg-[#09090e]/60 p-3 rounded-xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ProductLogo name={selectedOrder.package.product.name} size="md" />
                      <div>
                        <p className="font-bold text-foreground text-sm">{selectedOrder.package.product.name}</p>
                        <p className="text-muted-foreground">{selectedOrder.package.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">SKU: {selectedOrder.package.sku || "-"}</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-foreground">{formatIDR(selectedOrder.package.price)}</span>
                  </div>
                </div>

                {/* Payment proof / transfer slip */}
                {selectedOrder.paymentProof && (
                  <div>
                    <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">Bukti Pembayaran Manual</h4>
                    <div className="bg-card p-2.5 rounded-xl border border-border flex flex-col items-center gap-2">
                      <a href={selectedOrder.paymentProof} target="_blank" rel="noreferrer" className="block w-full text-center">
                        <img
                          src={selectedOrder.paymentProof}
                          alt="Slip Pembayaran"
                          className="max-h-56 object-contain rounded-lg border border-border mx-auto hover:opacity-90 transition"
                        />
                        <span className="text-[10px] text-primary mt-2 block underline font-bold cursor-pointer">Buka Gambar Di Tab Baru</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Admin notes */}
                <div>
                  <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">Catatan Administrasi</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Masukkan catatan internal staf..."
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                    />
                    <Button onClick={handleSaveNotes} className="bg-muted border border-border text-foreground hover:bg-muted">
                      Simpan
                    </Button>
                  </div>
                </div>

                {/* Stock distribution delivery panel */}
                {selectedOrder.status === "PAID" && (
                  <div>
                    <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">Status Stok Akun</h4>
                    {selectedOrder.digitalStock ? (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                        <p className="text-emerald-400 font-bold">Stok Berhasil Terkirim</p>
                        <p className="text-muted-foreground">Tipe: {selectedOrder.digitalStock.type}</p>
                        {selectedOrder.digitalStock.email && (
                          <p className="text-muted-foreground font-mono">Email: {selectedOrder.digitalStock.email}</p>
                        )}
                        <p className="text-muted-foreground text-[10px]">Stok terikat: ID #{selectedOrder.digitalStock.id}</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-4">
                        <div className="flex gap-2 text-rose-400">
                          <AlertTriangle className="shrink-0" size={16} />
                          <div>
                            <p className="font-bold">Persediaan Kosong (Habis)!</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                              Sistem gagal mendistribusikan akun secara otomatis karena tidak ada stok "Tersedia" untuk varian ini.
                            </p>
                          </div>
                        </div>

                        {/* Auto FEFO fulfillment trigger */}
                        <div className="space-y-2 pt-2 border-t border-border">
                          <p className="font-bold text-muted-foreground">Hubungkan Kredensial Tersedia:</p>
                          <button
                            onClick={() => setTakeModalOpen(true)}
                            className="inline-flex w-full items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-foreground font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
                          >
                            <Key size={14} /> Ambil Stok Tersedia (Auto FEFO)
                          </button>
                        </div>

                        {/* Direct manual text area delivery option */}
                        <div className="space-y-2 pt-2 border-t border-border">
                          <p className="font-bold text-muted-foreground">Kirim Stok Kustom Langsung (Tulis Manual):</p>
                          <textarea
                            className="w-full min-h-16 rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                            placeholder="Email: custom@mail.com | Pass: securePass123 | PIN: 1221"
                            value={manualStockText}
                            onChange={(e) => setManualStockText(e.target.value)}
                          />
                          <button
                            onClick={handleDeliverManualStock}
                            disabled={!manualStockText}
                            className="inline-flex w-full items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-foreground font-semibold py-2 rounded-xl text-xs transition cursor-pointer"
                          >
                            <Send size={12} /> Kirim Stok Kustom
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Actions */}
                {selectedOrder.status === "PENDING" && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <p className="font-bold text-muted-foreground">Persetujuan Transaksi:</p>
                    
                    {!showRejectForm ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, "PAID")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-foreground font-semibold py-2.5 rounded-xl cursor-pointer transition active:scale-[0.98]"
                        >
                          <Check size={16} /> Konfirmasi Lunas
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-semibold py-2.5 rounded-xl border border-rose-500/20 cursor-pointer transition active:scale-[0.98]"
                        >
                          Tolak Bukti
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/10 animate-in fade-in duration-200">
                        <label className="text-[10px] font-bold text-rose-400 block uppercase">Alasan Penolakan Transfer</label>
                        <Input
                          required
                          placeholder="Nominal tidak sesuai, bukti buram, dll..."
                          value={rejectReasonText}
                          onChange={(e) => setRejectReasonText(e.target.value)}
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowRejectForm(false)}
                            className="flex-1 bg-muted hover:bg-muted text-muted-foreground py-1.5 rounded-lg font-semibold"
                          >
                            Kembali
                          </button>
                          <button
                            type="button"
                            disabled={!rejectReasonText}
                            onClick={() => handleUpdateStatus(selectedOrder.id, "PENDING")}
                            className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-muted disabled:text-muted-foreground text-foreground py-1.5 rounded-lg font-semibold"
                          >
                            Kirim Tolak
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <StockTakeModal
          isOpen={takeModalOpen}
          onClose={() => setTakeModalOpen(false)}
          orderId={selectedOrder.id}
          packageId={selectedOrder.package.id}
          onSuccess={(stock) => {
            setActionMessage({ type: "success", text: "Stok otomatis berhasil dihubungkan!" });
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
