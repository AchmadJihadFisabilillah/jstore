import { notFound, redirect } from "next/navigation";
import { ShieldCheck, Calendar, Hash, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import { getSession } from "@/lib/auth/session";
import { formatRupiah } from "@/lib/utils";
import { CheckoutButton } from "@/components/sections/checkout-button";
import { SectionReveal } from "@/components/shared/section-reveal";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { packageId } = await params;
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    include: { product: true },
  });
  if (!pkg) return notFound();

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="w-full max-w-lg">
        <SectionReveal>
          {/* Back button */}
          <Link
            href={`/produk/${pkg.productId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke detail produk
          </Link>

          <div className="card-jstore border border-border bg-card backdrop-blur-md p-6 md:p-8 relative overflow-hidden">
            {/* Glow accent */}
            <div className="absolute top-0 right-0 h-24 w-24 -z-10 bg-violet-500/5 blur-2xl" />

            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Checkout</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pastikan detail pesanan Anda sudah benar.</p>
            
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold text-primary">
                <ShieldCheck size={12} /> Pembayaran aman via Mandiri QRIS
              </span>
            </div>

            {/* Order Details Panel */}
            <div className="mt-8 space-y-4 border-t border-b border-border py-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Tag size={16} className="text-primary" /> Produk
                </span>
                <span className="font-semibold text-foreground">{pkg.product.name}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Hash size={16} className="text-primary" /> Paket
                </span>
                <span className="font-semibold text-foreground">{pkg.name}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar size={16} className="text-primary" /> Durasi
                </span>
                <span className="font-semibold text-foreground">{pkg.duration} Hari</span>
              </div>
            </div>

            {/* Price section */}
            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground font-medium">Total Bayar</span>
              <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {formatRupiah(pkg.price)}
              </span>
            </div>

            <div id="checkout-action" className="mt-8">
              <CheckoutButton packageId={pkg.id} />
            </div>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}

