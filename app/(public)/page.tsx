import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Zap, ShieldCheck, RefreshCw, CreditCard, HelpCircle, MessageSquare } from "lucide-react";
import { productRepository } from "@/lib/repositories/product-repository";
import { SectionReveal } from "@/components/shared/section-reveal";
import { formatRupiah } from "@/lib/utils";
import { PhoneMockup } from "@/components/home/phone-mockup";
import { ProductLogo } from "@/components/admin/ProductLogo";

export default async function LandingPage() {
  const products = await productRepository.findAll();

  return (
    <main className="pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px]" />

        <div className="container-jstore">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            {/* Left Hero Content */}
            <SectionReveal>
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-primary">
                  <Sparkles size={12} className="text-primary fill-violet-400/20" /> Akun Legal & Garansi Aktif
                </span>
                
                <h1 className="mt-6 text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl tracking-tight">
                  Next level <br />
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent font-black">
                    premium access.
                  </span>
                </h1>
                
                <p className="mt-6 max-w-lg text-base text-muted-foreground leading-relaxed">
                  Nikmati kemudahan akses akun premium Netflix, Spotify, Canva, ChatGPT+, dan lainnya dengan mudah, instan, legal, dan bergaransi penuh.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full">
                  <Link
                    href="/produk"
                    className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 font-bold text-foreground shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    Mulai Belanja <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/fitur"
                    className="inline-flex w-full sm:w-auto justify-center items-center rounded-xl bg-muted border border-border hover:bg-muted px-6 py-3.5 font-semibold text-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Pelajari Selengkapnya
                  </Link>
                </div>
              </div>
            </SectionReveal>

            {/* Right Hero Image (Phone Mockup with Floating Apps) */}
            <SectionReveal delay={0.15}>
              <div className="relative flex justify-center items-center h-[350px] sm:h-[400px] lg:h-[500px]">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25)_0%,rgba(59,130,246,0.2)_50%,transparent_100%)] blur-3xl" />
                
                {/* Floating Logos */}
                <div className="absolute w-full h-full pointer-events-none">
                  {/* Netflix-like */}
                  <div className="absolute top-[10%] left-[5%] md:left-[15%] animate-float drop-shadow-[0_0_20px_rgba(229,9,20,0.4)]" style={{ animationDelay: '0s' }}>
                    <div className="w-14 h-14 bg-black border border-border rounded-2xl flex items-center justify-center transform -rotate-12 bg-gradient-to-br from-gray-900 to-black">
                      <span className="text-[#E50914] font-black text-2xl">N</span>
                    </div>
                  </div>
                  
                  {/* Spotify-like */}
                  <div className="absolute top-[20%] right-[5%] md:right-[15%] animate-float drop-shadow-[0_0_20px_rgba(30,215,96,0.4)]" style={{ animationDelay: '0.5s' }}>
                    <div className="w-14 h-14 bg-[#1DB954] border border-border rounded-full flex items-center justify-center transform rotate-12 bg-gradient-to-br from-[#1DB954] to-[#14833b]">
                       <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                       </svg>
                    </div>
                  </div>

                  {/* Canva-like */}
                  <div className="hidden sm:block absolute bottom-[20%] left-[0%] md:left-[10%] animate-float drop-shadow-[0_0_20px_rgba(0,196,204,0.4)]" style={{ animationDelay: '1s' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center transform -rotate-6 bg-gradient-to-br from-[#00C4CC] via-[#7D2AE8] to-[#00C4CC] border border-border p-0.5">
                       <div className="w-full h-full bg-card rounded-xl flex items-center justify-center">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C4CC] to-[#7D2AE8] font-black text-xl italic">Canva</span>
                       </div>
                    </div>
                  </div>

                  {/* ChatGPT-like */}
                  <div className="hidden sm:block absolute bottom-[10%] right-[0%] md:right-[10%] animate-float drop-shadow-[0_0_20px_rgba(16,163,127,0.4)]" style={{ animationDelay: '1.5s' }}>
                    <div className="w-14 h-14 bg-[#10A37F] border border-border rounded-2xl flex items-center justify-center transform rotate-6 bg-gradient-to-br from-[#10A37F] to-[#0a755a]">
                      <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM8 12h8M12 8v8" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Phone Frame */}
                <PhoneMockup />
              </div>
            </SectionReveal>
          </div>

          {/* Trust Bar */}
          <SectionReveal delay={0.2}>
            <div className="mt-16 w-full rounded-2xl border border-border bg-card backdrop-blur-md p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Zap, title: "Proses Instan", desc: "Akun aktif dalam 5 menit" },
                { icon: ShieldCheck, title: "Garansi Resmi", desc: "100% legal & aman" },
                { icon: RefreshCw, title: "Garansi Penuh", desc: "Refund & ganti baru" },
                { icon: CreditCard, title: "Pembayaran Aman", desc: "Verifikasi via Mandiri QRIS" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-primary">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Pricing / Products Section Highlights */}
      <section className="container-jstore section-space scroll-mt-20">
        <SectionReveal>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Pilihan Akun <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Terpopuler</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Pilih paket akun premium sharing atau private sesuai kebutuhan Anda.</p>
            </div>
            
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border hover:bg-muted px-5 py-3 text-sm font-semibold text-foreground transition-all shrink-0 self-center md:self-end"
            >
              Lihat Semua Produk <ArrowRight size={16} />
            </Link>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((product) => {
              const minPrice = product.packages.length > 0 
                ? Math.min(...product.packages.map((pack) => pack.price)) 
                : 0;

              return (
                <article
                  key={product.id}
                  className="card-jstore card-hover p-6 flex flex-col justify-between relative overflow-hidden border border-border bg-card backdrop-blur-md group"
                >
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.06)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <ProductLogo name={product.name} size="md" />
                      <span className="text-[10px] font-extrabold tracking-widest text-primary uppercase bg-violet-400/10 px-2.5 py-1 rounded-full border border-violet-400/20">
                        {product.category}
                      </span>
                    </div>
                    
                    <h3 className="mt-4 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-muted-foreground">Mulai dari</span>
                      <span className="text-lg font-extrabold text-foreground">
                        {formatRupiah(minPrice)}
                      </span>
                    </div>
                    
                    <Link
                      href={`/produk/${product.id}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-muted border border-border hover:bg-gradient-to-r hover:from-violet-600 hover:to-fuchsia-600 hover:border-transparent py-3 text-sm font-semibold text-foreground shadow-sm hover:shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all duration-300 active:scale-[0.98] cursor-pointer"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionReveal>
      </section>

      {/* Benefits Section */}
      <section className="container-jstore section-space pt-0 scroll-mt-20">
        <SectionReveal>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Benefit Belanja di <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">JStore</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Semua kemudahan dan jaminan kualitas layanan dalam satu platform.</p>
            </div>

            <Link
              href="/fitur"
              className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border hover:bg-muted px-5 py-3 text-sm font-semibold text-foreground transition-all shrink-0 self-center md:self-end"
            >
              Lihat Detail Fitur <ArrowRight size={16} />
            </Link>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Checkout Cepat via Mandiri QRIS", desc: "Bayar secara instan menggunakan scan QRIS dinamis Bank Mandiri." },
              { title: "Harga Hemat Mahasiswa", desc: "Akun sharing legal dengan harga patungan yang jauh lebih hemat dibanding langganan mandiri." },
              { title: "Support Responsif & Garansi", desc: "Tim support siap membantu jika ada kendala durasi atau reset password selama masa aktif paket." }
            ].map((item, idx) => (
              <div key={idx} className="card-jstore p-6 border border-border bg-card backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 h-24 w-24 -z-10 rounded-full bg-violet-500/5 blur-xl group-hover:bg-violet-500/10 transition-colors" />
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* Testimonials Section */}
      <section className="container-jstore section-space pt-0 scroll-mt-20">
        <SectionReveal>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Apa Kata <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Mereka?</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Ulasan asli dari pelanggan setia kami.</p>
            </div>

            <Link
              href="/testimoni"
              className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border hover:bg-muted px-5 py-3 text-sm font-semibold text-foreground transition-all shrink-0 self-center md:self-end"
            >
              Lihat Semua Testimoni <ArrowRight size={16} />
            </Link>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { quote: "Proses cepat banget, ga sampai 5 menit setelah transfer langsung dikirim detail akunnya. Udah 3 bulan langganan di sini aman terus.", author: "Dina", role: "Mahasiswa Universitas Indonesia" },
              { quote: "Canva Pro & ChatGPT Plus-nya ngebantu banget buat kerjaan freelance saya. Harga hemat tapi kualitas bintang lima, ga pernah ada kendala.", author: "Raka", role: "UI/UX Designer Freelance" }
            ].map((item, idx) => (
              <blockquote key={idx} className="card-jstore p-6 border border-border bg-card backdrop-blur-md relative group hover:border-violet-500/20 transition-all duration-300">
                <p className="text-muted-foreground italic leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                <cite className="mt-6 block not-italic">
                  <span className="font-bold text-foreground block">{item.author}</span>
                  <span className="text-xs text-muted-foreground">{item.role}</span>
                </cite>
              </blockquote>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* FAQ Section */}
      <section className="container-jstore section-space pt-0 scroll-mt-20">
        <SectionReveal>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Pertanyaan Umum <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">FAQ</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Masih bingung? Temukan jawaban untuk hal-hal yang sering ditanyakan.</p>
            </div>

            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border hover:bg-muted px-5 py-3 text-sm font-semibold text-foreground transition-all shrink-0 self-center md:self-end"
            >
              Lihat FAQ Lengkap <ArrowRight size={16} />
            </Link>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.12}>
          <div className="space-y-4">
            {[
              { q: "Apakah akun yang dijual legal?", a: "Ya, seluruh akun kami didaftarkan secara legal. Kami menggunakan paket sharing resmi atau metode upgrade legal sesuai kebijakan masing-masing platform." },
              { q: "Bagaimana cara melakukan klaim garansi?", a: "Jika akun mengalami kendala sebelum masa aktif habis, silakan hubungi tim support kami via dashboard/WhatsApp dengan menyertakan detail order untuk diproses garansinya." },
              { q: "Berapa lama proses pengiriman akun?", a: "Sistem kami terintegrasi, pesanan akan otomatis terproses secara instan (rata-rata 1-5 menit) setelah pembayaran dikonfirmasi oleh Mandiri QRIS." }
            ].map((item, idx) => (
              <div key={idx} className="card-jstore p-6 border border-border bg-card backdrop-blur-md">
                <p className="font-bold text-foreground text-base flex items-center gap-2">
                  <HelpCircle size={16} className="text-primary" />
                  {item.q}
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed ml-6">{item.a}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-border">
        <div className="container-jstore flex flex-col sm:flex-row items-center justify-between gap-4 py-10 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} JStore. Hak Cipta Dilindungi.</p>
          <p className="inline-flex items-center gap-1.5 text-primary font-medium">
            <ShieldCheck size={16} /> Trusted Premium Access Partner
          </p>
        </div>
      </footer>
    </main>
  );
}
