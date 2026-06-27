"use client";

import { useState } from "react";
import { SectionReveal } from "@/components/shared/section-reveal";
import { Zap, ShieldCheck, RefreshCw, CreditCard, Headphones, Crown, X, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type BenefitFeature = {
  id: string;
  icon: any;
  title: string;
  shortDesc: string;
  longDesc: string;
  details: string[];
  tips: string;
};

const FEATURES: BenefitFeature[] = [
  {
    id: "instant",
    icon: Zap,
    title: "Proses Instan Otomatis",
    shortDesc: "Akun aktif dalam 1-5 menit setelah pembayaran selesai.",
    longDesc: "Kami menggunakan integrasi sistem otomatis. Begitu pembayaran Anda diverifikasi oleh Mandiri QRIS, detail akun (email, password, profil) akan langsung dikirim ke email Anda dan tercatat di dashboard riwayat transaksi.",
    details: [
      "Verifikasi pembayaran otomatis real-time",
      "Detail login langsung dikirim tanpa menunggu admin",
      "Tersedia panduan instruksi login yang jelas"
    ],
    tips: "Gunakan e-wallet seperti GoPay atau QRIS untuk proses pembayaran tercepat yang langsung terverifikasi otomatis."
  },
  {
    id: "warranty",
    icon: ShieldCheck,
    title: "Garansi Resmi 100%",
    shortDesc: "Jaminan akun aktif penuh sesuai dengan paket yang Anda beli.",
    longDesc: "Keamanan Anda adalah prioritas kami. Semua akun di JStore didaftarkan secara legal dan bergaransi penuh. Jika ada kendala teknis (seperti password berubah atau status premium hilang), kami menjamin perbaikan instan.",
    details: [
      "Garansi berlaku selama sisa masa aktif paket",
      "Klaim garansi instan via Dashboard atau WhatsApp support",
      "Bukan metode ilegal/crack yang gampang mati"
    ],
    tips: "Selalu ikuti aturan penggunaan profil agar akun Anda tidak terkena pembatasan atau terkena reset paksa."
  },
  {
    id: "full-coverage",
    icon: RefreshCw,
    title: "Garansi Ganti Baru",
    shortDesc: "Solusi cepat ganti baru jika akun mengalami kendala teknis.",
    longDesc: "Apabila akun yang Anda terima mengalami gangguan sistem yang tidak dapat diperbaiki dalam 1x24 jam, tim support kami akan memberikan akun pengganti baru (backup) secara gratis tanpa biaya tambahan.",
    details: [
      "Proses replacement cepat tanpa ribet",
      "Akun backup dengan durasi penuh yang disesuaikan",
      "Garansi refund jika akun pengganti tidak tersedia"
    ],
    tips: "Harap simpan screenshot kendala login Anda untuk mempercepat proses verifikasi klaim di tim CS kami."
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Gerbang Pembayaran Aman",
    shortDesc: "Mendukung QRIS, GoPay, OVO, transfer bank, hingga retail store.",
    longDesc: "JStore terintegrasi secara resmi dengan Mandiri Merchant (payment gateway berlisensi Bank Indonesia). Semua data transaksi Anda dienkripsi penuh dan dijamin keamanannya tanpa risiko fraud.",
    details: [
      "Mendukung QRIS nasional untuk semua e-wallet",
      "Transfer Bank (Virtual Account Mandiri, BCA, BNI, BRI)",
      "Bisa bayar cash via Alfamart dan Indomaret"
    ],
    tips: "Pembayaran Virtual Account dan QRIS memiliki tingkat keberhasilan verifikasi otomatis sebesar 99.9%."
  },
  {
    id: "support",
    icon: Headphones,
    title: "Customer Support Responsif",
    shortDesc: "Tim bantuan yang ramah siap melayani kendala Anda.",
    longDesc: "Mengalami masalah saat login atau bingung cara menggunakan akun? CS JStore siap membantu Anda dari pukul 08:00 hingga 22:00 WIB setiap harinya dengan panduan yang jelas dan solutif.",
    details: [
      "Pelayanan chat support responsif",
      "Bantuan remote jika diperlukan bagi pemula",
      "Penyelesaian tiket garansi kurang dari 2 jam"
    ],
    tips: "Gunakan tombol bantuan WhatsApp di dashboard jika Anda memerlukan respon darurat di luar jam operasional."
  },
  {
    id: "premium",
    icon: Crown,
    title: "Kualitas Akun Premium Asli",
    shortDesc: "Streaming tanpa gangguan dengan kualitas audio-visual tertinggi.",
    longDesc: "Akun yang Anda beli merupakan akun premium orisinil dari platform resmi. Bukan modifikasi, bukan file APK bajakan, dan bukan trial 1 hari. Anda mendapatkan semua fitur premium resmi.",
    details: [
      "Streaming kualitas 4K UHD + HDR (jika didukung perangkat)",
      "Bebas iklan (No Ads) dan bebas skip lagu tak terbatas",
      "Bisa download film & musik secara offline resmi"
    ],
    tips: "Pastikan koneksi internet Anda stabil minimal 15 Mbps untuk menikmati tayangan Ultra HD/4K tanpa buffer."
  }
];

export default function FiturPage() {
  const [selectedFeature, setSelectedFeature] = useState<BenefitFeature | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 pt-12 md:pt-16">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-fuchsia-600/5 blur-[130px] pointer-events-none" />

      <div className="container-jstore">
        {/* Header Section */}
        <SectionReveal>
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              💎 Keunggulan Platform & Layanan Kami
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Kenapa Harus Belanja di <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">JStore?</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Kami berkomitmen menghadirkan layanan berlangganan akun premium yang mudah, cepat, aman, dan ramah kantong. Temukan fitur unggulan kami di bawah ini.
            </p>
          </div>
        </SectionReveal>

        {/* Interactive Features Grid */}
        <SectionReveal delay={0.05}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  onClick={() => setSelectedFeature(feat)}
                  className="card-jstore p-6 border border-border bg-card backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 -z-10 rounded-full bg-violet-500/0 blur-xl group-hover:bg-violet-500/10 transition-colors" />
                  
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-primary group-hover:bg-violet-500 group-hover:text-foreground transition-all duration-300">
                      <Icon size={24} />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feat.shortDesc}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:text-primary">
                    Pelajari Detail <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionReveal>

        {/* Feature Comparison Table */}
        <SectionReveal delay={0.12}>
          <div className="mt-20">
            <div className="mb-8 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Tabel Perbandingan Layanan</h2>
              <p className="mt-2 text-sm text-muted-foreground">Lihat perbandingan kualitas belanja premium di JStore dibanding alternatif lainnya.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-white/[0.02] text-sm text-foreground">
                    <th className="p-5 font-semibold">Fitur / Kualitas</th>
                    <th className="p-5 font-semibold text-primary">JStore Premium</th>
                    <th className="p-5 font-semibold text-muted-foreground">Toko Online Biasa</th>
                    <th className="p-5 font-semibold text-muted-foreground">Langganan Langsung</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-muted-foreground divide-y divide-white/5">
                  <tr>
                    <td className="p-5 font-medium text-foreground">Harga Berlangganan</td>
                    <td className="p-5 text-primary font-semibold">Sangat Hemat (Patungan)</td>
                    <td className="p-5">Murah (Rentan Scammer)</td>
                    <td className="p-5">Sangat Mahal (Normal)</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-foreground">Jaminan Garansi</td>
                    <td className="p-5">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Check size={16} /> Aktif Durasi Penuh
                      </span>
                    </td>
                    <td className="p-5 text-amber-500 font-medium">Garansi 1-3 Hari Saja</td>
                    <td className="p-5 text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Check size={16} /> Resmi & Garansi
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-foreground">Kecepatan Pengiriman</td>
                    <td className="p-5 text-primary font-semibold">Instan 1-5 Menit (Otomatis)</td>
                    <td className="p-5 text-amber-500 font-medium">Manual (Tergantung Admin)</td>
                    <td className="p-5 text-emerald-400 font-semibold">Instan</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-foreground">Legalitas Akun</td>
                    <td className="p-5 text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Check size={16} /> Legal & Aman
                      </span>
                    </td>
                    <td className="p-5 text-rose-500 font-medium">Sering Kena Banned/Crack</td>
                    <td className="p-5 text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Check size={16} /> Resmi & Legal
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-foreground">Gerbang Pembayaran</td>
                    <td className="p-5">Mandiri QRIS (Dinamis)</td>
                    <td className="p-5">Transfer Manual (Bukti Chat)</td>
                    <td className="p-5">Kartu Kredit / PayPal saja</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </SectionReveal>

        {/* CTA to Products */}
        <SectionReveal delay={0.15}>
          <div className="mt-20 text-center rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-900/10 to-fuchsia-900/10 backdrop-blur-md p-10 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_60%)] pointer-events-none" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Siap Menikmati Fitur Premium?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Dapatkan produk premium favorit Anda sekarang juga dengan harga terbaik dan proses transaksi kilat otomatis.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/produk"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 font-bold text-foreground shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                Jelajahi Produk Sekarang <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>

      {/* Interactive Detail Modal Dialog */}
      <AnimatePresence>
        {selectedFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="absolute inset-0 bg-background/70 dark:bg-[#000000]/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg rounded-2xl border border-border bg-card dark:bg-[#0c0c10] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-primary">
                  {(() => {
                    const FeatureIcon = selectedFeature.icon;
                    return <FeatureIcon size={20} />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-foreground">{selectedFeature.title}</h3>
              </div>

              {/* Description */}
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                {selectedFeature.longDesc}
              </p>

              {/* Features List */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cakupan Keunggulan</h4>
                {selectedFeature.details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Check size={10} />
                    </span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              {/* Tip / Note Box */}
              <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 flex gap-3 text-xs leading-relaxed text-primary">
                <AlertTriangle size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tips Penggunaan:</span> {selectedFeature.tips}
                </div>
              </div>

              {/* Footer Button */}
              <button
                onClick={() => setSelectedFeature(null)}
                className="mt-8 w-full rounded-xl bg-muted border border-border hover:bg-muted py-3 text-sm font-semibold text-foreground transition-all cursor-pointer text-center"
              >
                Tutup Jendela
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
