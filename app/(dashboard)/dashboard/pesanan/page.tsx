import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Search, Filter, Eye, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { formatRupiah } from "@/lib/utils";

// Adding dynamic forces dynamic rendering so searchParams work correctly without caching old state
export const dynamic = 'force-dynamic';

export default async function PesananPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const filterStatus = status || "ALL";

  const orders = await prisma.order.findMany({
    where: { 
      userId: session.user.id,
    },
    include: {
      package: { include: { product: true } },
      payment: true
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter logic in memory for simplicity given standard user order volume
  const filteredOrders = orders.filter(order => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING_PAYMENT") return order.status === "PENDING" || (order as any).payment?.status === "REJECTED";
    if (filterStatus === "PROCESSING") return order.status === "PAYMENT_REVIEW" || order.status === "PROCESSING" || order.status === "WAITING_STOCK";
    if (filterStatus === "COMPLETED") return order.status === "PAID" || order.status === "COMPLETED" || order.status === "DELIVERED";
    if (filterStatus === "CANCELLED") return order.status === "EXPIRED" || order.status === "CANCELLED";
    return true;
  });

  const tabs = [
    { id: "ALL", label: "Semua" },
    { id: "PENDING_PAYMENT", label: "Menunggu Bayar" },
    { id: "PROCESSING", label: "Diproses" },
    { id: "COMPLETED", label: "Selesai" },
    { id: "CANCELLED", label: "Dibatalkan" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Pesanan Saya</h1>
        <p className="text-muted-foreground text-sm">Lacak status pesanan dan konfirmasi pembayaran Anda di sini.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto gap-2">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/dashboard/pesanan${tab.id !== 'ALL' ? `?status=${tab.id}` : ''}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === tab.id 
                  ? "bg-violet-600 text-foreground shadow-md shadow-violet-900/20" 
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Search & Filter (Visual only for now, logic can be added later) */}
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Cari invoice atau produk..." 
              className="w-full bg-card border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>
          <button className="flex items-center justify-center bg-card border border-border rounded-xl w-10 h-10 text-muted-foreground hover:text-foreground transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const isPendingPayment = order.status === "PENDING" || (order as any).payment?.status === "REJECTED";
            const isProcessing = order.status === "PAYMENT_REVIEW" || order.status === "PROCESSING" || order.status === "WAITING_STOCK";
            const isCompleted = order.status === "PAID" || order.status === "COMPLETED" || order.status === "DELIVERED";
            const isCancelled = order.status === "EXPIRED" || order.status === "CANCELLED";

            return (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-5 hover:border-border transition-all">
                <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="text-muted-foreground" size={20} />
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">{order.invoiceNo || order.id.slice(-8).toUpperCase()}</span>
                      <span className="text-muted-foreground mx-2">•</span>
                      <span className="text-xs text-muted-foreground">{order.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${isCompleted ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        isProcessing ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        isPendingPayment ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-gray-500/10 text-muted-foreground border border-gray-500/20'}`}>
                      {order.status === 'PAYMENT_REVIEW' ? 'DIVERIFIKASI' : (order as any).payment?.status === 'REJECTED' ? 'DITOLAK' : isProcessing ? 'DIPROSES' : isPendingPayment ? 'MENUNGGU BAYAR' : isCompleted ? 'SELESAI' : 'DIBATALKAN'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center p-2 shrink-0">
                      {order.package.product.logoUrl ? (
                         <img src={order.package.product.logoUrl} alt={order.package.product.name} className="w-full h-full object-contain" />
                       ) : (
                         <Package className="text-muted-foreground" size={24} />
                       )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base mb-1">{order.package.product.name}</h3>
                      <p className="text-sm text-muted-foreground">{order.package.name}</p>
                      <div className="mt-2 font-semibold text-foreground">
                        {formatRupiah(order.package.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                    {isPendingPayment ? (
                      <Link href={`/pembayaran/${order.invoiceNo}`} className="w-full md:w-auto text-center bg-violet-600 hover:bg-violet-500 text-foreground px-5 py-2 rounded-lg font-semibold text-sm transition-colors">
                        Bayar Sekarang
                      </Link>
                    ) : isCompleted ? (
                      <Link href={`/dashboard/langganan/${order.id}`} className="w-full md:w-auto text-center bg-muted hover:bg-muted text-foreground px-5 py-2 rounded-lg font-semibold text-sm transition-colors border border-border">
                        Lihat Akun
                      </Link>
                    ) : null}
                    <Link href={`/dashboard/pesanan/${order.id}`} className="w-full md:w-auto text-center text-muted-foreground hover:text-foreground px-5 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center md:justify-end gap-1">
                      Detail Pesanan <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Tidak ada pesanan</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Anda belum memiliki pesanan dengan status {tabs.find(t => t.id === filterStatus)?.label.toLowerCase()}.
            </p>
            <Link href="/#pricing" className="bg-muted hover:bg-white/20 text-foreground px-6 py-2.5 rounded-xl font-medium transition-colors text-sm">
              Mulai Belanja
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
