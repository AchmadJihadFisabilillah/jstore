import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Package, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { formatRupiah } from "@/lib/utils";
import { ReviewForm } from "@/components/shared/review-form";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { 
      id,
    },
    include: {
      package: { include: { product: true } },
      review: true,
      payment: true
    }
  });

  if (!order || order.userId !== session.user.id) {
    redirect("/dashboard/pesanan");
  }

  const isPendingPayment = order.status === "PENDING" && !order.paymentProof;
  const isProcessing = order.status === "PENDING" && !!order.paymentProof;
  const isCompleted = order.status === "PAID";
  const isCancelled = order.status === "EXPIRED";

  // Timeline definition
  const timeline = [
    {
      id: 1,
      title: "Pesanan Dibuat",
      description: "Pesanan telah diterima sistem.",
      date: order.createdAt,
      isCompleted: true,
      icon: <FileText size={16} />
    },
    {
      id: 2,
      title: "Menunggu Pembayaran",
      description: "Selesaikan pembayaran sesuai nominal yang tertera.",
      date: isPendingPayment ? null : order.createdAt,
      isCompleted: !isPendingPayment,
      icon: <CreditCard size={16} />
    },
    {
      id: 3,
      title: "Pembayaran Diterima",
      description: "Admin sedang memverifikasi pembayaran Anda.",
      date: isProcessing || isCompleted ? order.createdAt : null, // Idealnya butuh tanggal upload bukti, untuk dummy pakai createdAt
      isCompleted: isProcessing || isCompleted,
      icon: <Clock size={16} />
    },
    {
      id: 4,
      title: "Pesanan Diproses",
      description: "Sistem/Admin sedang menyiapkan akun premium Anda.",
      date: isProcessing || isCompleted ? order.createdAt : null,
      isCompleted: isCompleted,
      icon: <Package size={16} />
    },
    {
      id: 5,
      title: "Pesanan Selesai",
      description: "Akun premium telah dikirim dan aktif.",
      date: isCompleted && order.startDate ? order.startDate : null,
      isCompleted: isCompleted,
      icon: <CheckCircle2 size={16} />
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pesanan" className="p-2 rounded-xl bg-muted hover:bg-muted text-foreground transition-colors border border-border">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
            Detail Pesanan
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
              ${isCompleted ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                isProcessing ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                isPendingPayment ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                'bg-gray-500/10 text-muted-foreground border border-gray-500/20'}`}>
              {isProcessing ? 'DIPROSES' : isPendingPayment ? 'MENUNGGU BAYAR' : isCompleted ? 'SELESAI' : 'DIBATALKAN'}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Invoice: {order.invoiceNo || order.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Tracking Timeline */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">Pelacakan Pesanan</h2>
            
            <div className="relative border-l-2 border-border ml-4 space-y-8 pb-4">
              {timeline.map((step, index) => (
                <div key={step.id} className="relative pl-8">
                  <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full border-4 border-[#0d0d12] flex items-center justify-center
                    ${step.isCompleted ? 'bg-violet-600 text-foreground' : 'bg-muted text-muted-foreground'} transition-colors`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${step.isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</h3>
                    <p className={`text-xs mt-1 ${step.isCompleted ? 'text-muted-foreground' : 'text-gray-600'}`}>{step.description}</p>
                    {step.date && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-2">
                        {step.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isProcessing && (
              <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-400 flex items-start gap-3">
                <Clock className="shrink-0 mt-0.5" size={18} />
                <p>Pesanan Anda sedang diproses oleh admin. Estimasi selesai dalam 5–15 menit. Silakan refresh halaman ini secara berkala.</p>
              </div>
            )}

            {isCancelled && order.rejectionReason && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-semibold mb-1">Pesanan Dibatalkan</p>
                  <p>{order.rejectionReason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/dashboard/bantuan" className="flex-1 text-center bg-card border border-border hover:bg-muted text-foreground px-5 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={16} /> Hubungi Bantuan
            </Link>
            {isCompleted && (
              <Link href={`/dashboard/langganan/${order.id}`} className="flex-1 text-center bg-violet-600 hover:bg-violet-500 text-foreground px-5 py-3 rounded-xl font-semibold text-sm transition-colors">
                Lihat Detail Akun
              </Link>
            )}
          </div>
          
          {/* Review Section */}
          {isCompleted && (
             <ReviewForm 
               orderId={order.id} 
               hasReviewed={!!order.review} 
               existingReview={order.review || undefined} 
             />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-4">Detail Produk</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center p-2 shrink-0 border border-border">
                {order.package.product.logoUrl ? (
                   <img src={order.package.product.logoUrl} alt={order.package.product.name} className="w-full h-full object-contain" />
                 ) : (
                   <Package className="text-muted-foreground" size={24} />
                 )}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{order.package.product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{order.package.name}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga Paket</span>
                <span className="text-foreground font-medium">{formatRupiah(order.package.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metode</span>
                <span className="text-foreground font-medium">Transfer Bank / QRIS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="text-foreground font-medium">{order.createdAt.toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-3 border-t border-border mt-3">
                <span className="text-foreground">Total Bayar</span>
                <span className="text-primary">{formatRupiah(order.package.price)}</span>
              </div>
            </div>
          </div>

          {isPendingPayment && (
            <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full"></div>
              <h2 className="text-base font-bold text-foreground mb-2 relative z-10">Lanjutkan Pembayaran</h2>
              <p className="text-xs text-muted-foreground mb-6 relative z-10">Silakan lakukan pembayaran agar pesanan Anda dapat segera kami proses.</p>
              
              {order.payment?.provider === "MANDIRI" && order.invoiceNo ? (
                <Link
                  href={`/pembayaran/${order.invoiceNo}`}
                  className="block w-full text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02] transition-transform text-foreground px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-900/20 relative z-10"
                >
                  Selesaikan Pembayaran (QRIS)
                </Link>
              ) : (
                <button className="w-full text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02] transition-transform text-foreground px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-900/20 relative z-10">
                  Hubungi Admin untuk Bayar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
