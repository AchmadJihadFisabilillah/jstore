import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  FileText
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { differenceInDays } from "date-fns";
import { CredentialsCard } from "@/components/dashboard/credentials-card";

export default async function LanggananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const sub = await prisma.subscription.findUnique({
    where: { 
      id,
    },
    include: {
      package: { include: { product: true } },
      order: { include: { digitalStocks: true } }
    }
  });

  // Only allow owner
  if (!sub || sub.userId !== session.user.id) {
    redirect("/dashboard/langganan");
  }

  const isExpired = sub.status === "EXPIRED" || (sub.endDate && sub.endDate < new Date());
  const daysLeft = sub.endDate && !isExpired ? differenceInDays(sub.endDate, new Date()) : 0;
  
  // Extract digital stock from the initial order
  const digitalStock = sub.order?.digitalStocks?.[0];

  // Masking email logic to send safely
  const maskEmail = (email: string | null | undefined) => {
    if (!email) return null;
    const parts = email.split('@');
    if (parts.length !== 2) return "••••••••";
    return `${parts[0].substring(0, 2)}••••@${parts[1]}`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/langganan" className="p-2 rounded-xl bg-muted hover:bg-muted text-foreground transition-colors border border-border">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
            Detail Layanan
            {isExpired ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-500/10 text-muted-foreground border border-gray-500/20">
                Kedaluwarsa
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                Aktif
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{sub.package.product.name} - {sub.package.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          {/* Credentials Card (Client Component for security toggle) */}
          <CredentialsCard 
            orderId={sub.orderId || ''}
            maskedEmail={maskEmail(digitalStock?.email)}
            hasPin={!!digitalStock?.pin}
            hasCode={!!digitalStock?.code}
            hasLink={!!digitalStock?.link}
          />

          {/* Usage Instructions / Terms */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Petunjuk Penggunaan & Syarat
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
              {sub.package.product.usageGuide ? (
                <div dangerouslySetInnerHTML={{ __html: sub.package.product.usageGuide.replace(/\n/g, '<br />') }} />
              ) : (
                <ul className="list-disc pl-4 space-y-2">
                  <li>Dilarang mengubah email dan password akun.</li>
                  <li>Dilarang mengubah profil pembayaran.</li>
                  <li>Gunakan profil yang telah disediakan (jika ada).</li>
                  <li>Pelanggaran ketentuan dapat menyebabkan garansi hangus.</li>
                </ul>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href={`/dashboard/bantuan/buat?orderId=${sub.orderId}`} className="flex-1 text-center bg-card border border-border hover:bg-muted text-foreground px-5 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={16} /> Laporkan Masalah
            </Link>
          </div>
        </div>

        {/* Subscription Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-4">Informasi Langganan</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center p-2 shrink-0 border border-border">
                {sub.package.product.logoUrl ? (
                   <img src={sub.package.product.logoUrl} alt={sub.package.product.name} className="w-full h-full object-contain" />
                 ) : (
                   <ShieldCheck className="text-muted-foreground" size={24} />
                 )}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{sub.package.product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{sub.package.name}</p>
                <div className="text-xs font-semibold text-primary mt-2 flex items-center gap-1">
                  <ShieldCheck size={14} /> Garansi: {sub.package.warranty || "Sesuai durasi"}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mulai</span>
                <span className="text-foreground font-medium">{sub.startDate?.toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Berakhir</span>
                <span className="text-foreground font-medium">{sub.endDate?.toLocaleDateString('id-ID') || "Seumur Hidup"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sisa Waktu</span>
                <span className={daysLeft <= 7 ? "text-red-400 font-bold" : "text-foreground font-medium"}>
                  {isExpired ? "0 Hari" : `${daysLeft} Hari`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID Langganan</span>
                <span className="text-foreground font-mono text-xs">{sub.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <Link href={`/#pricing`} className="w-full block text-center bg-violet-600 hover:bg-violet-500 text-foreground px-5 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-900/20">
                Perpanjang Layanan
              </Link>
            </div>
          </div>
          
          {daysLeft <= 7 && !isExpired && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-400 flex items-start gap-3">
              <Clock className="shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold mb-1">Masa Aktif Hampir Habis</p>
                <p className="text-xs">Layanan Anda akan berakhir dalam {daysLeft} hari. Segera perpanjang agar tidak kehilangan akses.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
