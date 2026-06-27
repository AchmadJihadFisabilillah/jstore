"use client";

import { useState } from "react";
import { SectionReveal } from "@/components/shared/section-reveal";
import { ChevronDown, Search, HelpCircle, ArrowRight, MessageSquareCode, ShieldCheck, CreditCard, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type FAQItem = {
  id: string;
  category: "umum" | "garansi" | "pembayaran";
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    category: "umum",
    question: "Apakah akun premium yang dijual di JStore legal?",
    answer: "Ya, seluruh akun premium di JStore didaftarkan secara legal. Kami menggunakan metode patungan berlangganan resmi (sharing) atau pendaftaran mandiri (private) sesuai ketentuan masing-masing penyedia layanan."
  },
  {
    id: "faq-2",
    category: "umum",
    question: "Apa bedanya akun tipe Sharing dengan tipe Private?",
    answer: "Akun Sharing adalah satu akun premium resmi yang digunakan bersama (patungan) oleh beberapa pengguna (masing-masing mendapat 1 slot profile mandiri yang tidak boleh saling diganggu). Sedangkan akun Private adalah akun premium yang sepenuhnya didedikasikan untuk Anda sendiri (full profile milik Anda)."
  },
  {
    id: "faq-3",
    category: "pembayaran",
    question: "Berapa lama proses setelah saya membayar pesanan?",
    answer: "Sistem JStore sepenuhnya otomatis. Setelah pembayaran terverifikasi oleh Mandiri QRIS (umumnya dalam 1-5 menit), detail login akun (email, password, slot profil) akan langsung dikirim ke email Anda dan muncul di halaman riwayat order akun Anda."
  },
  {
    id: "faq-4",
    category: "garansi",
    question: "Bagaimana cara melakukan klaim garansi jika terjadi kendala?",
    answer: "Klaim garansi sangat mudah. Anda cukup masuk ke Dashboard transaksi Anda, cari pesanan yang bermasalah, lalu klik tombol 'Laporkan Kendala'. Tim support kami akan langsung memeriksa dan memproses penggantian akun dalam waktu singkat."
  },
  {
    id: "faq-5",
    category: "garansi",
    question: "Berapa lama durasi garansi yang saya dapatkan?",
    answer: "Seluruh produk premium di JStore dilindungi oleh garansi penuh selama masa aktif berlangganan yang Anda beli. Contohnya, jika Anda membeli paket 30 hari, maka garansi perbaikan atau ganti baru berlaku utuh selama 30 hari tersebut."
  },
  {
    id: "faq-6",
    category: "pembayaran",
    question: "Metode pembayaran apa saja yang didukung oleh JStore?",
    answer: "Kami mendukung berbagai pilihan pembayaran aman yang terverifikasi otomatis via Mandiri QRIS dinamis sekali pakai menggunakan e-wallet atau Mobile Banking Anda."
  },
  {
    id: "faq-7",
    category: "umum",
    question: "Apakah saya bisa memperpanjang akun yang sudah dibeli sebelumnya?",
    answer: "Untuk beberapa produk seperti Spotify, Canva, dan ChatGPT, Anda bisa memperpanjang akun yang sama. Namun untuk beberapa layanan sharing lainnya, Anda mungkin akan diberikan detail akun baru saat perpanjangan demi alasan stabilitas sistem."
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "umum" | "garansi" | "pembayaran">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter(item => item !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 pt-12 md:pt-16">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-fuchsia-600/5 blur-[130px] pointer-events-none" />

      <div className="container-jstore max-w-4xl">
        {/* Header Section */}
        <SectionReveal>
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              💡 Pusat Bantuan & Pertanyaan Umum
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Pertanyaan Umum <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">FAQ</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Temukan jawaban cepat untuk pertanyaan yang sering diajukan mengenai cara pemesanan, legalitas akun, hingga sistem garansi kami.
            </p>
          </div>
        </SectionReveal>

        {/* Search and Filters */}
        <SectionReveal delay={0.05}>
          <div className="space-y-6 mb-10">
            {/* Search Input */}
            <div className="relative w-full max-w-xl mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ketik pertanyaan atau kata kunci bantuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-card text-sm text-foreground placeholder-gray-500 outline-none focus:border-violet-500/30 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
              />
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: "Semua FAQ", icon: LayoutGrid },
                { id: "umum", label: "Umum & Akun", icon: HelpCircle },
                { id: "garansi", label: "Garansi", icon: ShieldCheck },
                { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as any)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "border-violet-500/50 bg-card text-foreground shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                        : "border-border bg-white/[0.01] hover:bg-white/[0.03] text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TabIcon size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionReveal>

        {/* FAQ Interactive Accordion List */}
        <SectionReveal delay={0.1}>
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="card-jstore border border-border bg-card py-16 text-center">
                <HelpCircle size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-muted-foreground font-semibold">Pertanyaan tidak ditemukan</p>
                <p className="text-xs text-muted-foreground mt-1">Coba gunakan kata kunci lain seperti 'garansi', 'sharing' atau 'metode'.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredFaqs.map((faq) => {
                  const isExpanded = expandedIds.includes(faq.id);
                  return (
                    <motion.div
                      key={faq.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                      className={`card-jstore border transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? "border-violet-500/30 bg-muted dark:bg-[#0c0c10] shadow-[0_4px_20px_rgba(139,92,246,0.05)]"
                          : "border-border bg-card hover:border-border"
                      }`}
                    >
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => toggleExpand(faq.id)}
                        className="w-full flex items-center justify-between gap-4 p-5 text-left text-foreground outline-none cursor-pointer select-none"
                      >
                        <span className="font-bold text-sm sm:text-base leading-relaxed flex items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-primary text-xs font-bold">
                            Q
                          </span>
                          {faq.question}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`text-muted-foreground shrink-0 transition-transform duration-300 ${
                            isExpanded ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </button>

                      {/* Accordion Answer Content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-5 pb-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-white/[0.03] ml-9">
                              <p className="pt-4">{faq.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </SectionReveal>

        {/* Still Have Questions CTA */}
        <SectionReveal delay={0.15}>
          <div className="mt-16 text-center card-jstore border border-border bg-card backdrop-blur-md p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-primary">
                <MessageSquareCode size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Masih Belum Menemukan Jawaban?</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Hubungi customer support kami secara langsung melalui WhatsApp.</p>
              </div>
            </div>

            <Link
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border hover:bg-muted px-6 py-3 font-semibold text-foreground transition-all duration-300 shrink-0 cursor-pointer"
            >
              Hubungi CS Kami <ArrowRight size={16} />
            </Link>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
}
