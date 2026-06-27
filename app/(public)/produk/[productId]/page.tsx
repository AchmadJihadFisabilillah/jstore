import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Sparkles, Clock, ArrowLeft, Zap, Info, CheckCircle, List, UserCheck, AlertTriangle } from "lucide-react";
import { productRepository } from "@/lib/repositories/product-repository";
import { formatRupiah } from "@/lib/utils";
import { SectionReveal } from "@/components/shared/section-reveal";
import { ProductLogo } from "@/components/admin/ProductLogo";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { ReviewList } from "@/components/shared/review-list";
import { PackageComparison } from "@/components/product/package-comparison";
import { StickyPurchaseBar } from "@/components/product/sticky-purchase-bar";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await productRepository.findById(productId);
  if (!product) return notFound();

  // Fetch reviews for this product
  const { prisma } = await import("@/lib/prisma/client");
  const reviews = await prisma.review.findMany({
    where: {
      package: { productId }
    },
    include: {
      user: { select: { name: true } },
      package: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const activePackages = product.packages.filter(p => p.isActive);

  return (
    <main className="relative min-h-screen pb-24 pt-8 md:pt-12 overflow-hidden">
      {/* Glow Background */}
      <div 
        className="absolute top-0 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full blur-[150px] opacity-20 pointer-events-none" 
        style={{ backgroundColor: product.brandColor || "#8B5CF6" }}
      />

      <div className="container-jstore max-w-6xl">
        {/* Back Button */}
        <SectionReveal>
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 md:mb-8 transition-colors touch-target"
          >
            <ArrowLeft size={16} /> Kembali ke Katalog
          </Link>
        </SectionReveal>

        {/* Top Split: Visual Left, Info Right */}
        <SectionReveal delay={0.05}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            
            {/* Visual Left */}
            <div className="lg:col-span-5">
              <div className="border border-border bg-card backdrop-blur-md rounded-3xl p-8 flex items-center justify-center aspect-square relative group overflow-hidden sticky top-24">
                <div 
                  className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-white/20 transition-opacity duration-500 group-hover:opacity-20"
                  style={{ backgroundColor: product.brandColor || "transparent" }}
                />
                <ProductLogo 
                  name={product.name} 
                  logoUrl={product.logoUrl} 
                  size="xl" 
                />
                
                <div className="absolute top-4 right-4 bg-background/40 p-2 rounded-full backdrop-blur-md border border-border z-10">
                  <WishlistButton productId={product.id} />
                </div>
              </div>
            </div>

            {/* Info Right */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <span className="text-[10px] font-extrabold tracking-widest text-primary uppercase bg-violet-400/10 px-3 py-1.5 rounded-full border border-violet-400/20">
                  {product.category}
                </span>
                {product.isBestseller && (
                  <span className="text-[10px] font-extrabold tracking-widest text-fuchsia-400 uppercase bg-fuchsia-400/10 px-3 py-1.5 rounded-full border border-fuchsia-400/20">
                    Terlaris
                  </span>
                )}
                {product.isNew && (
                  <span className="text-[10px] font-extrabold tracking-widest text-blue-400 uppercase bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
                    Terbaru
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-black text-foreground md:text-5xl tracking-tight leading-tight">
                {product.name}
              </h1>
              
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 py-6 border-y border-border">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Aktivasi</span>
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                    <Zap size={14} className="text-amber-400" />
                    {product.activationType || "Otomatis"}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Estimasi</span>
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                    <Clock size={14} className="text-blue-400" />
                    {product.processingType || "Instan"}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Garansi</span>
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    {product.warrantyDuration || "Penuh"}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ulasan</span>
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                    <Sparkles size={14} className="text-yellow-400" />
                    {reviews.length} Ulasan
                  </div>
                </div>
              </div>
              
              {/* How to buy timeline short */}
              <div className="mt-8 bg-muted border border-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-widest flex items-center gap-2">
                  <List size={16} /> Cara Membeli
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between text-xs text-muted-foreground relative">
                  <div className="hidden sm:block absolute top-3 left-6 right-6 h-px bg-muted -z-10" />
                  <div className="flex items-center sm:flex-col gap-3 sm:gap-2 text-left sm:text-center">
                    <div className="w-6 h-6 rounded-full bg-violet-600 text-foreground flex items-center justify-center font-bold text-[10px] z-10">1</div>
                    <span>Pilih Paket</span>
                  </div>
                  <div className="flex items-center sm:flex-col gap-3 sm:gap-2 text-left sm:text-center">
                    <div className="w-6 h-6 rounded-full bg-violet-600 text-foreground flex items-center justify-center font-bold text-[10px] z-10">2</div>
                    <span>Lakukan Pembayaran</span>
                  </div>
                  <div className="flex items-center sm:flex-col gap-3 sm:gap-2 text-left sm:text-center">
                    <div className="w-6 h-6 rounded-full bg-violet-600 text-foreground flex items-center justify-center font-bold text-[10px] z-10">3</div>
                    <span>Terima Akun di Dashboard</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </SectionReveal>

        {/* Packages Selection & Comparison */}
        <SectionReveal delay={0.1}>
          <div className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" /> Pilih Paket Langganan
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Pilih durasi dan jenis layanan yang sesuai dengan kebutuhan Anda.</p>
              </div>
            </div>
            
            <div id="paket" className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {activePackages.map((pkg) => {
                const isOutOfStock = pkg.stockStatus === "Habis";
                return (
                  <article
                    key={pkg.id}
                    className={`card-jstore p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 group ${
                      isOutOfStock ? "bg-red-500/5 border-red-500/20 opacity-70" : "bg-card hover:bg-muted dark:bg-[#12121A] border-border hover:border-violet-500/50 dark:hover:bg-[#161622] hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-violet-400 transition-colors">
                          {pkg.name}
                        </h3>
                        {pkg.discount > 0 && (
                          <span className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                            HEMAT {pkg.discount}%
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 text-sm text-muted-foreground font-medium bg-background/30 p-4 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3">
                          <Zap size={16} className="text-amber-400 opacity-80" />
                          <span>Durasi: <strong className="text-foreground">{pkg.duration} Hari</strong></span>
                        </div>
                        {pkg.warranty && (
                          <div className="flex items-center gap-3">
                            <ShieldCheck size={16} className="text-blue-400 opacity-80" />
                            <span>Garansi: <strong className="text-foreground">{pkg.warranty}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <CheckCircle size={16} className={isOutOfStock ? "text-red-400 opacity-80" : "text-emerald-400 opacity-80"} />
                          <span>Status: <strong className={isOutOfStock ? "text-red-400" : "text-emerald-400"}>{pkg.stockStatus || "Tersedia"}</strong></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border/50">
                      {pkg.discount > 0 && pkg.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through mb-1">
                          {formatRupiah(pkg.originalPrice)}
                        </p>
                      )}
                      <p className="text-3xl font-black text-foreground">
                        {formatRupiah(pkg.price)}
                      </p>
                      
                      {isOutOfStock ? (
                        <span
                          className="mt-6 flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold text-muted-foreground transition-all bg-muted cursor-not-allowed"
                        >
                          Stok Habis
                        </span>
                      ) : (
                        <Link
                          href={`/checkout/${pkg.id}`}
                          className="mt-6 flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98] bg-violet-600 hover:bg-violet-500 shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)]"
                        >
                          Beli Sekarang
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <PackageComparison packages={activePackages} />
          </div>
        </SectionReveal>

        {/* Detailed Information Accordions / Tabs */}
        <SectionReveal delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                <UserCheck size={18} className="text-emerald-400" /> Yang Anda Dapatkan
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  Akses layanan premium sesuai varian yang dipilih.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  Petunjuk penggunaan dan panduan aktivasi (jika manual).
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  Layanan garansi sesuai ketentuan produk.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  Dukungan pelanggan via tiket jika mengalami kendala.
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-amber-400" /> Syarat & Ketentuan
              </h3>
              <div className="text-sm text-muted-foreground space-y-3">
                {product.terms ? (
                  <div dangerouslySetInnerHTML={{ __html: product.terms }} className="prose prose-sm prose-invert" />
                ) : (
                  <ul className="space-y-2">
                    <li>• Dilarang mengubah email atau kata sandi jika ini adalah akun sharing.</li>
                    <li>• Gunakan sesuai batas perangkat yang ditentukan varian.</li>
                    <li>• Pelanggaran aturan dapat menyebabkan garansi hangus.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Reviews Section */}
        <SectionReveal delay={0.2}>
          <div className="border-t border-border pt-12">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  Ulasan Pelanggan Terverifikasi
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Ulasan hanya dapat diberikan oleh pengguna yang telah menyelesaikan pesanan.</p>
              </div>
            </div>
            
            <ReviewList reviews={reviews as any} />
          </div>
        </SectionReveal>
      </div>

      <StickyPurchaseBar product={product} packages={activePackages} />
    </main>
  );
}
