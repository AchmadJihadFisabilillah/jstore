import { redirect } from "next/navigation";
import { Ticket, Clock, Info } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { formatRupiah } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export const dynamic = 'force-dynamic';

export default async function VoucherPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  // Fetch all vouchers that are active
  const vouchers = await prisma.voucher.findMany({
    where: { 
      isActive: true,
      endDate: { gt: new Date() } // Still valid
    },
    orderBy: { createdAt: "desc" },
  });

  // Since VoucherUsages tracks how many times a user used a voucher, we need to check if user has reached maxPerUser
  const userUsages = await prisma.voucherUsage.findMany({
    where: { userId: session.user.id }
  });

  const usageCountMap = userUsages.reduce((acc, usage) => {
    acc[usage.voucherId] = (acc[usage.voucherId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const processedVouchers = vouchers.map(voucher => {
    const isQuotaFull = voucher.usedCount >= voucher.quota;
    const userUsedCount = usageCountMap[voucher.id] || 0;
    const isUserMaxedOut = userUsedCount >= voucher.maxPerUser;
    
    return {
      ...voucher,
      isAvailable: !isQuotaFull && !isUserMaxedOut,
      reason: isUserMaxedOut ? "Sudah Digunakan" : isQuotaFull ? "Kuota Habis" : "Tersedia"
    };
  });

  // For this page, we'll use a Client Component for the copy button logic, but we can do it inline with a small script or standard client component.
  // We'll extract a small client component for the voucher card to handle "copy".

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Voucher Saya</h1>
        <p className="text-muted-foreground text-sm">Gunakan kode voucher di bawah ini untuk mendapatkan diskon tambahan saat berbelanja.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedVouchers.length > 0 ? (
          processedVouchers.map(voucher => (
            <div key={voucher.id} className={`bg-card border rounded-2xl p-6 relative overflow-hidden transition-all
              ${voucher.isAvailable ? 'border-border hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'border-border opacity-60 grayscale-[0.5]'}`}>
              
              {/* Decorative circles */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-r border-border z-10"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-l border-border z-10"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center border border-violet-500/20 text-primary">
                  <Ticket size={24} />
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                    ${voucher.isAvailable ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-muted-foreground border border-gray-500/20'}`}>
                    {voucher.reason}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-foreground text-lg mb-1">{voucher.name}</h3>
                <p className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Diskon {voucher.discountType === 'PERCENTAGE' ? `${voucher.discountValue}%` : formatRupiah(voucher.discountValue)}
                </p>
              </div>

              <div className="space-y-2 mb-6 border-t border-dashed border-border pt-4">
                {voucher.minPurchase > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info size={14} /> Min. Belanja: {formatRupiah(voucher.minPurchase)}
                  </div>
                )}
                {voucher.maxDiscount && voucher.discountType === 'PERCENTAGE' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info size={14} /> Maks. Diskon: {formatRupiah(voucher.maxDiscount)}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={14} /> Berlaku s/d: {voucher.endDate.toLocaleDateString('id-ID')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted border border-border border-dashed rounded-lg py-2.5 px-4 text-center font-mono font-bold text-foreground tracking-widest">
                  {voucher.code}
                </div>
                <CopyButton code={voucher.code} disabled={!voucher.isAvailable} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <Ticket className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Belum ada voucher tersedia</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Saat ini tidak ada promo atau voucher yang tersedia. Silakan cek kembali nanti untuk penawaran menarik!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
