import { prisma } from "@/lib/prisma/client";
import { OrderStatus } from "@prisma/client";
import { TrendingUp, DollarSign, Briefcase, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { PrintButton } from "@/components/ui/print-button";

export const revalidate = 0; // Fresh reports data on load

export default async function AdminReportsPage() {
  // Query all successful orders
  const paidOrders = await prisma.order.findMany({
    where: { status: OrderStatus.PAID },
    include: {
      package: {
        include: { product: true },
      },
    },
  });

  // Query all packages to get unsold stock data
  const packages = await prisma.package.findMany({
    include: {
      product: true,
      _count: {
        select: {
          digitalStocks: { where: { status: "AVAILABLE" } },
        },
      },
    },
  });

  // Calculate high-level metrics
  let totalRevenue = 0;
  let totalCost = 0;
  let totalAssetValue = 0;

  // Breakdown aggregators
  const productBreakdown: Record<
    string,
    { name: string; qty: number; revenue: number; cost: number; profit: number; unsoldQty: number; assetValue: number }
  > = {};

  paidOrders.forEach((order) => {
    const price = order.package.price;
    const cost = order.package.costPrice || 0;

    totalRevenue += price;
    totalCost += cost;

    const prodId = order.package.productId;
    const prodName = order.package.product.name;

    if (!productBreakdown[prodId]) {
      productBreakdown[prodId] = {
        name: prodName,
        qty: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        unsoldQty: 0,
        assetValue: 0,
      };
    }

    productBreakdown[prodId].qty += 1;
    productBreakdown[prodId].revenue += price;
    productBreakdown[prodId].cost += cost;
    productBreakdown[prodId].profit += price - cost;
  });

  // Accumulate unsold stocks
  packages.forEach((pkg) => {
    const prodId = pkg.productId;
    const prodName = pkg.product.name;
    const unsold = pkg._count.digitalStocks;
    const asset = unsold * (pkg.costPrice || 0);

    totalAssetValue += asset;

    if (!productBreakdown[prodId]) {
      productBreakdown[prodId] = {
        name: prodName,
        qty: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        unsoldQty: 0,
        assetValue: 0,
      };
    }

    productBreakdown[prodId].unsoldQty += unsold;
    productBreakdown[prodId].assetValue += asset;
  });

  const netProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const breakdownList = Object.values(productBreakdown).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-foreground">Laporan Keuangan & Penjualan</h1>
          <p className="text-xs text-muted-foreground mt-1">Laporan margin keuntungan, omset kotor, pengeluaran modal, dan performa produk digital.</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block text-zinc-900 mb-8 border-b-2 border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-center">LAPORAN KEUANGAN JSTORE</h1>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Dicetak pada: {format(new Date(), "d MMMM yyyy HH:mm", { locale: localeId })}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Revenue */}
        <div className="card-jstore p-5 border border-border bg-[#09090e]/60 print:bg-white print:border-zinc-300 print:text-zinc-950">
          <span className="text-xs font-semibold text-muted-foreground print:text-muted-foreground">Omset Penjualan (Kotor)</span>
          <h3 className="text-2xl font-extrabold text-foreground mt-2 leading-none print:text-zinc-950">
            {formatIDR(totalRevenue)}
          </h3>
          <p className="text-[10px] text-emerald-400 mt-2 font-semibold">Total dari {paidOrders.length} transaksi sukses</p>
        </div>

        {/* COGS / Cost */}
        <div className="card-jstore p-5 border border-border bg-[#09090e]/60 print:bg-white print:border-zinc-300 print:text-zinc-950">
          <span className="text-xs font-semibold text-muted-foreground print:text-muted-foreground">Pengeluaran HPP (Modal)</span>
          <h3 className="text-2xl font-extrabold text-foreground mt-2 leading-none print:text-zinc-950">
            {formatIDR(totalCost)}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-2">Akumulasi modal beli stock terpakai</p>
        </div>

        {/* Net Profit */}
        <div className="card-jstore p-5 border border-border bg-[#09090e]/60 print:bg-white print:border-zinc-300 print:text-zinc-950">
          <span className="text-xs font-semibold text-muted-foreground print:text-muted-foreground">Laba Bersih (Profit)</span>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-2 leading-none print:text-emerald-600">
            {formatIDR(netProfit)}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-2">Persentase Laba: {marginPercent.toFixed(1)}%</p>
        </div>

        {/* Asset Value */}
        <div className="card-jstore p-5 border border-border bg-[#09090e]/60 print:bg-white print:border-zinc-300 print:text-zinc-950 sm:col-span-3">
          <span className="text-xs font-semibold text-muted-foreground print:text-muted-foreground">Estimasi Nilai Aset (Stok Mengendap)</span>
          <h3 className="text-2xl font-extrabold text-pink-400 mt-2 leading-none print:text-pink-600">
            {formatIDR(totalAssetValue)}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-2">Modal beli yang masih berupa stok digital (belum terjual)</p>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground print:text-zinc-950">Rincian Performa per Produk</h2>
        
        <div className="card-jstore border border-border bg-[#09090e]/60 overflow-x-auto print:border-zinc-300 print:bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold bg-card print:text-zinc-800 print:border-zinc-300 print:bg-zinc-100">
                <th className="p-4">Nama Produk Digital</th>
                <th className="p-4 text-center">Unit Terjual</th>
                <th className="p-4 text-center">Sisa Stok</th>
                <th className="p-4 text-right">Omset Kotor</th>
                <th className="p-4 text-right">HPP Modal</th>
                <th className="p-4 text-right">Nilai Aset</th>
                <th className="p-4 text-right">Laba Bersih</th>
                <th className="p-4 text-center">Margin</th>
              </tr>
            </thead>
            <tbody>
              {breakdownList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">Belum ada data penjualan tercatat.</td>
                </tr>
              ) : (
                breakdownList.map((p, idx) => {
                  const productMargin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
                  return (
                    <tr key={idx} className="border-b border-border hover:bg-muted transition print:text-zinc-900 print:border-zinc-300">
                      <td className="p-4 font-bold text-foreground print:text-zinc-900">{p.name}</td>
                      <td className="p-4 text-center font-semibold text-muted-foreground print:text-zinc-700">{p.qty} Pcs</td>
                      <td className="p-4 text-center font-semibold text-pink-400 print:text-pink-600">{p.unsoldQty} Pcs</td>
                      <td className="p-4 text-right font-bold text-foreground print:text-zinc-900">{formatIDR(p.revenue)}</td>
                      <td className="p-4 text-right text-muted-foreground print:text-zinc-600">{formatIDR(p.cost)}</td>
                      <td className="p-4 text-right font-bold text-pink-400/80 print:text-pink-600/80">{formatIDR(p.assetValue)}</td>
                      <td className="p-4 text-right font-extrabold text-emerald-400 print:text-emerald-600">{formatIDR(p.profit)}</td>
                      <td className="p-4 text-center font-bold text-muted-foreground print:text-muted-foreground">{productMargin.toFixed(0)}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
