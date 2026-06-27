import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  PackageOpen, 
  CreditCard, 
  Clock, 
  Ticket as TicketIcon, 
  LifeBuoy, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Eye,
  Copy,
  Info,
  Sparkles,
  Award,
  Heart
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { formatRupiah } from "@/lib/utils";
import { SectionReveal } from "@/components/shared/section-reveal";
import { differenceInDays } from "date-fns";
import { ProductLogo } from "@/components/admin/ProductLogo";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  // Fetch data
  const userId = session.user.id;
  
  const [
    allOrders,
    activeTickets,
    availableVouchers,
    recommendedProducts,
    loyaltyPoint,
    wishlist
  ] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { 
        package: { include: { product: true } },
        digitalStocks: true,
        payment: true
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ticket.count({
      where: { userId, status: { notIn: ["RESOLVED", "REJECTED"] } }
    }),
    prisma.voucher.count({
      where: { isActive: true, endDate: { gt: new Date() }, quota: { gt: prisma.voucher.fields.usedCount } }
    }),
    prisma.product.findMany({
      where: { isActive: true, OR: [{ isRecommended: true }, { isBestseller: true }] },
      take: 4,
      include: { packages: { orderBy: { price: "asc" }, take: 1 } }
    }),
    prisma.loyaltyPoint.findUnique({
      where: { userId }
    }),
    prisma.wishlist.count({
      where: { userId }
    })
  ]);

  // Derived state
  const activeSubscriptions = allOrders.filter(o => o.status === "PAID" && o.endDate && o.endDate > new Date());
  const pendingOrders = allOrders.filter(o => o.status === "PENDING" || o.status === "PAYMENT_REVIEW" || (o as any).payment?.status === "REJECTED"); 
  const processingOrders = allOrders.filter(o => ["PROCESSING", "WAITING_STOCK"].includes(o.status));
  const expiringSoon = activeSubscriptions.filter(o => o.endDate && differenceInDays(o.endDate, new Date()) <= 7);
  
  const recentOrders = allOrders.slice(0, 5);
  
  const hasTransactions = allOrders.length > 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Sapaan is now inside the hero section of the page instead of just the top nav */}
      <SectionReveal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-foreground mb-1">Selamat datang kembali, {(session.user.name || "User").split(' ')[0]}!</h1>
            <p className="text-muted-foreground text-sm">Kelola pesanan, langganan, dan akun premium Anda di satu tempat.</p>
          </div>
          <Link 
            href="/#pricing" 
            className="relative z-10 shrink-0 flex items-center gap-2 bg-foreground text-background hover:opacity-90 transition-colors px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            Belanja Produk <ArrowRight size={16} />
          </Link>
        </div>
        
        {/* Loyalty Points Banner */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-foreground shadow-lg shadow-orange-500/20">
               <Award size={24} />
             </div>
             <div>
               <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">J-Points Anda</p>
               <h3 className="text-xl font-black text-foreground mt-0.5 flex items-center gap-2">
                 {loyaltyPoint?.balance?.toLocaleString('id-ID') || 0} <span className="text-sm font-medium text-amber-400">Pts</span>
               </h3>
             </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
             <div className="text-right">
               <p className="text-muted-foreground">Level Member</p>
               <p className="text-amber-400 uppercase">{loyaltyPoint?.level || "MEMBER"}</p>
             </div>
             <div className="h-8 w-px bg-muted"></div>
             <Link href="/dashboard/wishlist" className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors">
               <Heart size={16} className="fill-pink-400/20" />
               Wishlist ({wishlist})
             </Link>
          </div>
        </div>
      </SectionReveal>

      {/* Alert Banner for Important Conditions */}
      {pendingOrders.length > 0 && (
        <SectionReveal delay={0.1}>
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Menunggu Pembayaran</h4>
              <p className="text-xs mt-0.5 opacity-80">Anda memiliki {pendingOrders.length} pesanan yang menunggu pembayaran. Selesaikan pembayaran agar pesanan dapat diproses.</p>
            </div>
            <Link href={`/pembayaran/${pendingOrders[0]?.invoiceNo}`} className="shrink-0 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 transition-colors px-3 py-1.5 rounded-lg">
              Bayar Sekarang
            </Link>
          </div>
        </SectionReveal>
      )}

      {expiringSoon.length > 0 && (
        <SectionReveal delay={0.15}>
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
            <Clock size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Langganan Segera Berakhir</h4>
              <p className="text-xs mt-0.5 opacity-80">Ada {expiringSoon.length} layanan Anda yang akan berakhir dalam kurang dari 7 hari.</p>
            </div>
            <Link href="/dashboard/langganan" className="shrink-0 text-xs font-bold bg-red-500/20 hover:bg-red-500/30 transition-colors px-3 py-1.5 rounded-lg">
              Perpanjang
            </Link>
          </div>
        </SectionReveal>
      )}

      {/* Kartu Ringkasan */}
      <SectionReveal delay={0.2}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <SummaryCard icon={<PackageOpen />} title="Langganan Aktif" value={activeSubscriptions.length} color="violet" href="/dashboard/langganan" />
          <SummaryCard icon={<Clock />} title="Diproses" value={processingOrders.length} color="blue" href="/dashboard/pesanan?status=PROCESSING" />
          <SummaryCard icon={<CreditCard />} title="Menunggu Bayar" value={pendingOrders.length} color="amber" href="/dashboard/pesanan?status=PENDING" />
          <SummaryCard icon={<AlertTriangle />} title="Akan Berakhir" value={expiringSoon.length} color="red" href="/dashboard/langganan?filter=expiring" />
          <SummaryCard icon={<TicketIcon />} title="Voucher" value={availableVouchers} color="green" href="/dashboard/voucher" />
          <SummaryCard icon={<LifeBuoy />} title="Tiket Bantuan" value={activeTickets} color="slate" href="/dashboard/bantuan" />
        </div>
      </SectionReveal>

      {/* Main Content Area */}
      {hasTransactions ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Langganan Aktif Terbaru */}
            <SectionReveal delay={0.3}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Layanan Aktif Anda</h2>
                <Link href="/dashboard/langganan" className="text-sm text-primary hover:text-primary font-medium">Lihat Semua</Link>
              </div>
              
              {activeSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  {activeSubscriptions.slice(0, 3).map(sub => {
                    const daysLeft = sub.endDate ? differenceInDays(sub.endDate, new Date()) : 0;
                    const progress = sub.startDate && sub.endDate ? 
                      Math.max(0, Math.min(100, ((new Date().getTime() - sub.startDate.getTime()) / (sub.endDate.getTime() - sub.startDate.getTime())) * 100)) : 0;
                    
                    return (
                      <div key={sub.id} className="card-jstore border border-border bg-card p-5 group hover:border-border transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 flex items-center justify-center shrink-0">
                               <ProductLogo name={sub.package.product.name} size="md" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground text-base">{sub.package.product.name}</h3>
                              <p className="text-xs text-muted-foreground">{sub.package.name}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium border border-green-500/20">Aktif</span>
                                {daysLeft <= 7 && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-medium border border-red-500/20">Sisa {daysLeft} hari</span>}
                              </div>
                            </div>
                          </div>
                          <Link href={`/dashboard/langganan/${sub.id}`} className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted rounded-lg transition-colors">
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                        
                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Masa Aktif</span>
                            <span className="text-muted-foreground">{sub.startDate?.toLocaleDateString('id-ID')} - {sub.endDate?.toLocaleDateString('id-ID')}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${daysLeft <= 3 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-amber-500' : 'bg-green-500'}`} 
                              style={{ width: `${100 - progress}%` }} // Inverting progress to show remaining time visually
                            ></div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                           <Link href={`/dashboard/langganan/${sub.id}`} className="flex-1 text-center bg-muted hover:bg-muted text-foreground text-xs font-semibold py-2 rounded-lg transition-colors">
                             Detail Akun
                           </Link>
                           <Link href={`/dashboard/bantuan/buat?orderId=${sub.id}`} className="flex-1 text-center bg-muted hover:bg-muted text-foreground text-xs font-semibold py-2 rounded-lg transition-colors">
                             Lapor Masalah
                           </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-muted/50">
                   <ShieldCheck className="mx-auto text-muted-foreground mb-3" size={32} />
                   <h3 className="text-foreground font-medium mb-1">Tidak ada layanan aktif</h3>
                   <p className="text-xs text-muted-foreground mb-4">Anda tidak memiliki langganan yang sedang berjalan saat ini.</p>
                   <Link href="/#pricing" className="text-xs bg-violet-600 hover:bg-violet-500 text-foreground px-4 py-2 rounded-lg font-medium transition-colors">Mulai Berlangganan</Link>
                </div>
              )}
            </SectionReveal>

            {/* Pesanan Terbaru */}
            <SectionReveal delay={0.4}>
              <div className="flex items-center justify-between mb-4 mt-8">
                <h2 className="text-lg font-bold text-foreground">Pesanan Terbaru</h2>
                <Link href="/dashboard/pesanan" className="text-sm text-primary hover:text-primary font-medium">Lihat Semua</Link>
              </div>
              
              <div className="border border-border bg-card rounded-2xl overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-muted-foreground">
                    <thead className="text-xs uppercase bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Produk</th>
                        <th className="px-4 py-3 font-medium">Tanggal</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentOrders.map(order => (
                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-medium text-foreground">{order.package.product.name}</div>
                            <div className="text-xs mt-0.5">{order.package.name}</div>
                          </td>
                          <td className="px-4 py-4 text-xs whitespace-nowrap">
                            {order.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-4 font-medium text-foreground">
                            {formatRupiah(order.package.price)}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                              ${order.status === 'PAID' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                order.status === 'PAYMENT_REVIEW' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                (order as any).payment?.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                'bg-gray-500/10 text-muted-foreground border border-gray-500/20'}`}>
                              {order.status === 'PAYMENT_REVIEW' ? 'DIVERIFIKASI' : (order as any).payment?.status === 'REJECTED' ? 'DITOLAK' : order.status === 'PENDING' ? 'MENUNGGU BAYAR' : order.status === 'PAID' ? 'AKTIF' : order.status}
                            </span>
                            {(order.status === 'PENDING' || (order as any).payment?.status === 'REJECTED') && (
                              <Link href={`/pembayaran/${order.invoiceNo}`} className="block mt-2 text-xs text-magenta-500 hover:underline">Bayar/Upload</Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-border">
                  {recentOrders.map(order => (
                    <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-foreground text-sm">{order.package.product.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{order.package.name}</div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                          ${order.status === 'PAID' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                            order.status === 'PENDING' && order.paymentProof ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-gray-500/10 text-muted-foreground border border-gray-500/20'}`}>
                          {order.status === 'PENDING' && order.paymentProof ? 'DIPROSES' : order.status === 'PENDING' ? 'MENUNGGU BAYAR' : order.status === 'PAID' ? 'AKTIF' : order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-border">
                        <span className="text-muted-foreground">
                          {order.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-bold text-foreground">
                          {formatRupiah(order.package.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>

          <div className="space-y-6">
            {/* Promo / Recommendations Sidebar */}
            <SectionReveal delay={0.5}>
              <h2 className="text-base font-bold text-foreground mb-4">Rekomendasi Untuk Anda</h2>
              <div className="space-y-3">
                {recommendedProducts.map(product => (
                  <Link href={`/#pricing`} key={product.id} className="flex gap-3 bg-card border border-border p-3 rounded-xl hover:border-violet-500/30 transition-all group">
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">
                      <ProductLogo name={product.name} size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{product.name}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{product.shortDesc || "Layanan premium bergaransi"}</p>
                      <div className="text-xs font-semibold text-foreground mt-1">
                        Mulai {product.packages[0] ? formatRupiah(product.packages[0].price) : '-'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionReveal>
          </div>
        </div>
      ) : (
        /* Empty State */
        <SectionReveal delay={0.3}>
           <div className="mt-8 flex flex-col items-center justify-center py-16 px-4 bg-card border border-border rounded-3xl text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
             
             <div className="w-20 h-20 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-6 relative z-10">
               <PackageOpen className="text-primary" size={36} />
             </div>
             
             <h2 className="text-2xl font-bold text-foreground mb-3 relative z-10">Belum Ada Langganan Aktif</h2>
             <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm relative z-10">
               Anda belum memiliki layanan premium aktif. Temukan aplikasi streaming, musik, desain, AI, dan produktivitas dengan harga terbaik dan bergaransi penuh.
             </p>
             
             <Link href="/#pricing" className="relative z-10 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 transition-transform text-foreground px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-900/20">
               Mulai Belanja Sekarang <ArrowRight size={18} />
             </Link>
           </div>
           
           {/* Products Showcase for Empty State */}
           <div className="mt-12">
             <h3 className="text-lg font-bold text-foreground mb-6">Produk Populer</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedProducts.map(product => (
                  <div key={product.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col items-center text-center hover:border-violet-500/30 transition-all">
                    <div className="w-16 h-16 flex items-center justify-center mb-4">
                      <ProductLogo name={product.name} size="lg" />
                    </div>
                    <h4 className="font-bold text-foreground mb-1">{product.name}</h4>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{product.shortDesc}</p>
                    <Link href={`/#pricing`} className="mt-auto w-full py-2 bg-muted hover:bg-muted text-foreground text-xs font-bold rounded-lg transition-colors">
                      Lihat Paket
                    </Link>
                  </div>
                ))}
             </div>
           </div>
        </SectionReveal>
      )}
    </div>
  );
}

function SummaryCard({ icon, title, value, color, href }: { icon: React.ReactNode, title: string, value: number, color: string, href: string }) {
  const colorMap: Record<string, string> = {
    violet: "text-primary bg-violet-500/10 border-violet-500/20 group-hover:bg-violet-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20 group-hover:bg-green-500/20",
    slate: "text-slate-400 bg-slate-500/10 border-slate-500/20 group-hover:bg-slate-500/20",
  };

  return (
    <Link href={href} className="card-jstore border border-border bg-card p-4 rounded-xl hover:border-border transition-all group flex flex-col items-start gap-3">
      <div className={`p-2 rounded-lg border ${colorMap[color]} transition-colors`}>
        {/* Clone element to add size */}
        {React.cloneElement(icon as any, { size: 18 })}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-1 font-medium">{title}</div>
      </div>
    </Link>
  );
}

// Ensure React is imported for cloneElement
import React from 'react';
