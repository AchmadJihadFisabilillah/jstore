import { prisma } from "@/lib/prisma/client";
import { OrderStatus } from "@prisma/client";
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  History,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ProductLogo } from "@/components/admin";

export const revalidate = 0; // Disable caching for real-time dashboard data

export default async function AdminDashboardPage() {
  // 1. Fetch base statistics
  const [usersCount, productsCount, ordersStats, paidOrders, tickets, lowStockData, recentLogs] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count(),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { status: OrderStatus.PAID },
      include: { package: true },
    }),
    prisma.ticket.findMany({
      where: { status: { in: ["NEW", "IN_PROGRESS"] } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.package.findMany({
      where: { isActive: true },
      include: {
        product: true,
        _count: {
          select: {
            digitalStocks: {
              where: { status: "AVAILABLE" },
            },
          },
        },
      },
    }),
    prisma.adminActivityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Order Counts
  const orderCountMap: Record<string, number> = { PENDING: 0, PAID: 0, EXPIRED: 0 };
  ordersStats.forEach((stat) => {
    orderCountMap[stat.status] = stat._count._all;
  });
  const totalOrders = (orderCountMap.PENDING || 0) + (orderCountMap.PAID || 0) + (orderCountMap.EXPIRED || 0);

  // Financial Calculations
  let totalRevenue = 0;
  let totalCost = 0;
  paidOrders.forEach((o) => {
    totalRevenue += o.package.price;
    totalCost += o.package.costPrice;
  });
  const netProfit = totalRevenue - totalCost;

  // Daily & Monthly Revenue
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfThisMonth = new Date();
  startOfThisMonth.setDate(1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  const todayPaid = paidOrders.filter((o) => o.createdAt >= startOfToday);
  const monthPaid = paidOrders.filter((o) => o.createdAt >= startOfThisMonth);

  const dailyRevenue = todayPaid.reduce((sum, o) => sum + o.package.price, 0);
  const monthlyRevenue = monthPaid.reduce((sum, o) => sum + o.package.price, 0);

  // Low Stock Items (AVAILABLE digital stocks < 3)
  const lowStockPackages = lowStockData
    .map((pkg) => ({
      id: pkg.id,
      productName: pkg.product.name,
      packageName: pkg.name,
      available: pkg._count.digitalStocks,
    }))
    .filter((pkg) => pkg.available < 3);

  // Calculate Total Asset Value (Unsold Stock Value based on Cost Price)
  let totalAssetValue = 0;
  lowStockData.forEach((pkg) => {
    totalAssetValue += (pkg._count.digitalStocks * (pkg.costPrice || 0));
  });

  // Chart data: past 7 days of paid revenue
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const last7DaysStats = last7Days.map((date) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const dayOrders = paidOrders.filter((o) => o.createdAt >= date && o.createdAt < nextDate);
    const revenue = dayOrders.reduce((sum, o) => sum + o.package.price, 0);
    const label = format(date, "EEE", { locale: localeId });
    const fullDate = format(date, "d MMM", { locale: localeId });
    return { label, fullDate, revenue };
  });

  const maxRevenue = Math.max(...last7DaysStats.map((d) => d.revenue), 1);

  // Helper to format currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Recent Orders
  const recentOrders = await prisma.order.findMany({
    include: {
      user: true,
      package: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Dashboard Ringkasan</h1>
          <p className="text-xs text-muted-foreground mt-1">Analisis bisnis, status pesanan, dan penanganan tiket terkini.</p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted border border-border px-3.5 py-2 rounded-xl flex items-center gap-2 self-start backdrop-blur-sm">
          <Clock size={12} className="text-primary" /> Terakhir diperbarui: {format(new Date(), "HH:mm 'WIB'", { locale: localeId })}
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Revenue */}
        <div className="admin-card stat-card p-5 flex flex-col justify-between" data-accent="violet">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Pendapatan Bulan Ini</span>
            <div className="admin-icon-badge bg-violet-500/10 text-primary border border-violet-500/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-xl font-extrabold text-foreground leading-none tracking-tight">{formatIDR(monthlyRevenue)}</h3>
            <p className="text-[10px] text-muted-foreground mt-1.5">Hari ini: {formatIDR(dailyRevenue)}</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="admin-card stat-card p-5 flex flex-col justify-between" data-accent="emerald">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Total Keuntungan Bersih</span>
            <div className="admin-icon-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-xl font-extrabold text-foreground leading-none tracking-tight">{formatIDR(netProfit)}</h3>
            <p className="text-[10px] text-muted-foreground mt-1.5">Akumulasi seluruh penjualan sukses</p>
          </div>
        </div>

        {/* Paid Orders / Total */}
        <div className="admin-card stat-card p-5 flex flex-col justify-between" data-accent="indigo">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Pesanan Sukses (Lunas)</span>
            <div className="admin-icon-badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-xl font-extrabold text-foreground leading-none tracking-tight">{orderCountMap.PAID}</h3>
            <p className="text-[10px] text-muted-foreground mt-1.5">Dari total {totalOrders} transaksi masuk</p>
          </div>
        </div>

        {/* Pending Transfer Checks */}
        <div className="admin-card stat-card p-5 flex flex-col justify-between" data-accent="amber">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Menunggu Verifikasi</span>
            <div className="admin-icon-badge bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-xl font-extrabold text-foreground leading-none tracking-tight">{orderCountMap.PENDING}</h3>
            <p className="text-[10px] text-muted-foreground mt-1.5">Perlu pemrosesan atau cek transfer manual</p>
          </div>
        </div>

        {/* Asset Value (Unsold Stock) */}
        <div className="admin-card stat-card p-5 flex flex-col justify-between" data-accent="pink">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Nilai Aset Stok</span>
            <div className="admin-icon-badge bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-xl font-extrabold text-foreground leading-none tracking-tight">{formatIDR(totalAssetValue)}</h3>
            <p className="text-[10px] text-muted-foreground mt-1.5">Estimasi modal dari stok yang belum terjual</p>
          </div>
        </div>
      </div>

      {/* Charts & Alerts Grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sales Chart (2/3 width on wide screens) */}
        <div className="admin-card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="admin-section-title">Keuangan 7 Hari Terakhir</h2>
            <p className="admin-section-subtitle">Grafik omset harian dari pembayaran terkonfirmasi.</p>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 mt-6 pt-2 border-b border-border pb-2">
            {last7DaysStats.map((day, idx) => {
              const heightPercent = (day.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative">
                  {/* Tooltip */}
                  <div className="absolute -translate-y-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-card border border-violet-500/20 px-2.5 py-1.5 rounded-lg text-[9px] font-semibold text-foreground pointer-events-none whitespace-nowrap shadow-2xl shadow-violet-500/10 z-10">
                    {formatIDR(day.revenue)}
                  </div>
                  {/* Bar */}
                  <div className="w-full bg-muted rounded-md overflow-hidden h-28 flex items-end">
                    <div
                      style={{ height: `${Math.max(heightPercent, 3)}%` }}
                      className="admin-chart-bar w-full bg-gradient-to-t from-violet-600 to-indigo-400 group-hover:from-violet-500 group-hover:to-indigo-300 rounded-t-sm"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Alert Center (1/3 width) */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-section-title">Stok Kritis</h2>
              <span className="admin-badge bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {lowStockPackages.length} Peringatan
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {lowStockPackages.length === 0 ? (
                <div className="admin-empty-state py-8">
                  <CheckCircle size={28} className="text-emerald-500/40" />
                  <span className="text-xs">Semua stok produk tersedia dengan aman.</span>
                </div>
              ) : (
                lowStockPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3 rounded-xl border border-rose-500/10 bg-rose-500/5 flex items-center justify-between hover:bg-rose-500/8 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <ProductLogo name={pkg.productName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{pkg.productName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{pkg.packageName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="admin-badge text-[10px] text-rose-400 bg-rose-950/40 border border-rose-500/20">
                        Sisa: {pkg.available}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/stok"
            className="text-[11px] text-primary hover:text-primary font-semibold inline-flex items-center gap-1.5 mt-4 transition-all group"
          >
            Kelola Stok Digital <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* Recent Orders & Support Tickets */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-section-title">Transaksi Terbaru</h2>
              <Link
                href="/admin/pesanan"
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
              >
                Selengkapnya <ExternalLink size={10} />
              </Link>
            </div>

            <div className="space-y-2">
              {recentOrders.length === 0 ? (
                <div className="admin-empty-state">
                  <ShoppingBag size={28} />
                  <span className="text-xs">Belum ada transaksi pembelian.</span>
                </div>
              ) : (
                recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-3 rounded-xl bg-card border border-border flex items-center justify-between hover:bg-muted hover:border-white/[0.08] transition-all duration-200"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <ProductLogo name={o.package.product.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {o.package.product.name} - {o.package.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {o.invoiceNo || "Invoice No-Gen"} • {o.user.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs font-bold text-foreground">{formatIDR(o.package.price)}</p>
                      <span
                        className={cn(
                          "admin-badge mt-1 border",
                          o.status === OrderStatus.PAID
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : o.status === OrderStatus.PENDING
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : o.status === OrderStatus.PAYMENT_REVIEW
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : "bg-zinc-500/10 text-muted-foreground border-zinc-500/20"
                        )}
                      >
                        {o.status === OrderStatus.PAID ? "Lunas" : o.status === OrderStatus.PENDING ? "Menunggu" : o.status === OrderStatus.PAYMENT_REVIEW ? "Cek Bayar" : "Kadaluarsa"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Customer Tickets / CS */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-section-title">Tiket Layanan Aktif</h2>
              <Link
                href="/admin/layanan"
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
              >
                Selengkapnya <ExternalLink size={10} />
              </Link>
            </div>

            <div className="space-y-2">
              {tickets.length === 0 ? (
                <div className="admin-empty-state">
                  <CheckCircle size={28} className="text-emerald-500/40" />
                  <span className="text-xs">Tidak ada tiket aktif yang butuh penanganan.</span>
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-card border border-border flex items-center justify-between hover:bg-muted hover:border-white/[0.08] transition-all duration-200"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <div className="admin-icon-badge bg-teal-500/10 border border-teal-500/20 text-teal-400">
                        <MessageSquare size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          #{t.ticketNo} • {t.user.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span
                        className={cn(
                          "admin-badge border",
                          t.priority === "HIGH" || t.priority === "URGENT"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-zinc-500/10 text-muted-foreground border-zinc-500/20"
                        )}
                      >
                        {t.priority}
                      </span>
                      <p className="text-[9px] text-muted-foreground mt-1">
                        {format(new Date(t.createdAt), "d MMM HH:mm", { locale: localeId })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Actions & Audit Trail Section */}
      <div className="admin-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="admin-section-title">Audit Log Operasional</h2>
          <Link
            href="/admin/audit-logs"
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            Lihat Semua <ExternalLink size={10} />
          </Link>
        </div>

        <div className="space-y-2">
          {recentLogs.length === 0 ? (
            <div className="admin-empty-state">
              <History size={28} />
              <span className="text-xs">Belum ada aktivitas admin tercatat.</span>
            </div>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs hover:bg-muted transition-colors duration-200"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-6 w-6 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                    <User size={11} className="text-primary" />
                  </div>
                  <span className="font-semibold text-foreground truncate shrink-0">{log.user.name}</span>
                  <span className="admin-badge text-[9px] bg-muted border border-border text-muted-foreground">
                    {log.module}
                  </span>
                  <p className="text-muted-foreground truncate">{log.action}: {log.details}</p>
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0 ml-4">
                  {format(new Date(log.createdAt), "d MMM HH:mm", { locale: localeId })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
