import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Filter, FileText, Download, ArrowRight, Printer } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { formatRupiah } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const filterStatus = status || "ALL";

  // Filter only completed or fully rejected/expired payments for "history"
  const transactions = await prisma.order.findMany({
    where: { 
      userId: session.user.id,
      status: { in: ["PAID", "EXPIRED"] }
    },
    include: {
      package: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  const filteredTransactions = transactions.filter(t => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "SUCCESS") return t.status === "PAID";
    if (filterStatus === "FAILED") return t.status === "EXPIRED";
    return true;
  });

  const tabs = [
    { id: "ALL", label: "Semua Transaksi" },
    { id: "SUCCESS", label: "Berhasil" },
    { id: "FAILED", label: "Gagal / Dibatalkan" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Riwayat Transaksi</h1>
        <p className="text-muted-foreground text-sm">Lihat semua riwayat transaksi Anda dan unduh invoice pembelian.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto gap-2">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/dashboard/transaksi${tab.id !== 'ALL' ? `?status=${tab.id}` : ''}`}
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

        {/* Search */}
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="w-full bg-card border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(tx => {
            const isSuccess = tx.status === "PAID";

            return (
              <div key={tx.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-6 justify-between md:items-center hover:border-border transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border 
                    ${isSuccess ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {tx.invoiceNo || tx.id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md
                        ${isSuccess ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                        {isSuccess ? "Berhasil" : "Gagal"}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground text-base">{tx.package.product.name} - {tx.package.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tx.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-border w-full md:w-auto">
                  <div className="md:text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Total Belanja</p>
                    <p className="text-lg font-bold text-foreground">{formatRupiah(tx.package.price)}</p>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    {isSuccess && (
                      <Link 
                        href={`/dashboard/transaksi/${tx.id}/invoice`}
                        target="_blank"
                        className="flex-1 md:flex-none text-center flex items-center justify-center gap-2 bg-muted hover:bg-muted text-foreground px-4 py-2.5 rounded-xl font-medium text-sm transition-colors border border-border"
                      >
                        <Printer size={16} /> Invoice
                      </Link>
                    )}
                    <Link href={`/#pricing`} className="flex-1 md:flex-none text-center bg-violet-600 hover:bg-violet-500 text-foreground px-4 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                      Beli Lagi <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <FileText className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Tidak ada riwayat transaksi</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Anda belum memiliki riwayat transaksi dengan status {tabs.find(t => t.id === filterStatus)?.label.toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
