import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Search, Filter, ShieldCheck, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { formatRupiah } from "@/lib/utils";
import { differenceInDays } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function LanggananPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const filterType = filter || "ALL";

  const allSubscriptions = await prisma.subscription.findMany({
    where: { 
      userId: session.user.id,
    },
    include: {
      package: { include: { product: true } },
      order: { include: { digitalStocks: true } }, // To get credentials
    },
    orderBy: { endDate: "desc" },
  });

  const filteredSubscriptions = allSubscriptions.filter(sub => {
    const isExpired = sub.status === "EXPIRED" || (sub.endDate && sub.endDate < new Date());
    const daysLeft = sub.endDate && !isExpired ? differenceInDays(sub.endDate, new Date()) : 0;
    
    if (filterType === "ALL") return true;
    if (filterType === "ACTIVE") return !isExpired && daysLeft > 7;
    if (filterType === "EXPIRING") return !isExpired && daysLeft <= 7;
    if (filterType === "EXPIRED") return isExpired;
    return true;
  });

  const tabs = [
    { id: "ALL", label: "Semua" },
    { id: "ACTIVE", label: "Aktif" },
    { id: "EXPIRING", label: "Akan Berakhir" },
    { id: "EXPIRED", label: "Kedaluwarsa" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Langganan Saya</h1>
        <p className="text-muted-foreground text-sm">Kelola layanan premium aktif, lihat detail akun, dan lakukan perpanjangan.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto gap-2">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/dashboard/langganan${tab.id !== 'ALL' ? `?filter=${tab.id}` : ''}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === tab.id 
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
              placeholder="Cari layanan..." 
              className="w-full bg-card border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Subscription List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map(sub => {
            const isExpired = sub.status === "EXPIRED" || (sub.endDate && sub.endDate < new Date());
            const daysLeft = sub.endDate && !isExpired ? differenceInDays(sub.endDate, new Date()) : 0;
            const progress = sub.startDate && sub.endDate ? 
              Math.max(0, Math.min(100, ((new Date().getTime() - sub.startDate.getTime()) / (sub.endDate.getTime() - sub.startDate.getTime())) * 100)) : 100;

            return (
              <div key={sub.id} className="bg-card border border-border rounded-2xl p-6 hover:border-border transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center p-2 shrink-0 border border-border">
                      {sub.package.product.logoUrl ? (
                         <img src={sub.package.product.logoUrl} alt={sub.package.product.name} className="w-full h-full object-contain" />
                       ) : (
                         <ShieldCheck className="text-muted-foreground" size={24} />
                       )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{sub.package.product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub.package.name}</p>
                      <div className="flex gap-2 mt-2">
                        {isExpired ? (
                          <span className="text-[10px] bg-gray-500/10 text-muted-foreground px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-gray-500/20">Kedaluwarsa</span>
                        ) : (
                          <>
                            <span className="text-[10px] bg-green-500/10 text-green-400 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-green-500/20">Aktif</span>
                            {daysLeft <= 7 && (
                              <span className="text-[10px] bg-red-500/10 text-red-400 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-red-500/20 flex items-center gap-1">
                                <AlertTriangle size={10} /> Sisa {daysLeft} Hari
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6 bg-white/[0.02] rounded-xl p-4 border border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tanggal Mulai</span>
                    <span className="text-foreground font-medium">{sub.startDate?.toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tanggal Berakhir</span>
                    <span className="text-foreground font-medium">{sub.endDate?.toLocaleDateString('id-ID')}</span>
                  </div>
                  {!isExpired && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Sisa Masa Aktif</span>
                        <span className={daysLeft <= 7 ? "text-red-400 font-medium" : "text-muted-foreground font-medium"}>{daysLeft} Hari</span>
                      </div>
                      <div className="w-full bg-background/40 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${daysLeft <= 3 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : daysLeft <= 7 ? 'bg-amber-500' : 'bg-violet-500'}`} 
                          style={{ width: `${100 - progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link href={`/dashboard/langganan/${sub.id}`} className="flex-1 text-center bg-muted hover:bg-muted text-foreground px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors border border-border">
                    Detail Akun
                  </Link>
                  <Link href={`/#pricing`} className="text-center bg-violet-600 hover:bg-violet-500 text-foreground px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-900/20 flex items-center justify-center gap-2">
                    Perpanjang
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <ShieldCheck className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Tidak ada langganan</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Anda belum memiliki layanan premium dengan filter yang dipilih.
            </p>
            <Link href="/#pricing" className="bg-violet-600 hover:bg-violet-500 text-foreground px-6 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-lg shadow-violet-900/20">
              Jelajahi Produk
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
