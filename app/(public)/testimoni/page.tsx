"use client";

import { useState, useEffect } from "react";
import { SectionReveal } from "@/components/shared/section-reveal";
import { Star, MessageSquare, Plus, X, Award, CheckCircle2, User, Search, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  date: string;
  avatarSeed: string;
};

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "testi-1",
    name: "Dina Fitriani",
    role: "Mahasiswa Universitas Indonesia",
    quote: "Proses cepat banget, ga sampai 5 menit setelah transfer langsung dikirim detail akunnya. Udah 3 bulan langganan di sini aman terus tanpa kendala berarti. Sangat direkomendasikan buat anak kost!",
    rating: 5,
    date: "2026-05-12",
    avatarSeed: "dina"
  },
  {
    id: "testi-2",
    name: "Raka Prasetya",
    role: "UI/UX Designer Freelance",
    quote: "Canva Pro & ChatGPT Plus-nya ngebantu banget buat kerjaan freelance saya sehari-hari. Harga hemat tapi kualitas bintang lima, ga pernah ada kendala reset password.",
    rating: 5,
    date: "2026-05-24",
    avatarSeed: "raka"
  },
  {
    id: "testi-3",
    name: "Amelia Putri",
    role: "Content Creator",
    quote: "Beli akun Netflix dan Spotify Premium di sini murah banget. Respon adminnya juga super ramah pas nanya cara login di smart TV. Terima kasih JStore!",
    rating: 5,
    date: "2026-06-02",
    avatarSeed: "amel"
  },
  {
    id: "testi-4",
    name: "Budi Santoso",
    role: "Software Developer",
    quote: "Untuk kebutuhan Grok AI dan ChatGPT Plus langganan di sini paling worth it. Pembayaran otomatis QRIS langsung aktif. Mantap sistemnya!",
    rating: 5,
    date: "2026-06-10",
    avatarSeed: "budi"
  },
  {
    id: "testi-5",
    name: "Fajar Nugraha",
    role: "Karyawan Swasta",
    quote: "Sempat ada kendala login sekali karena platform limit, tapi klaim garansi langsung diganti baru kurang dari 1 jam. Supportnya juara!",
    rating: 4,
    date: "2026-06-15",
    avatarSeed: "fajar"
  }
];

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("jstore_testimonials");
    if (saved) {
      try {
        setTestimonials(JSON.parse(saved));
      } catch (e) {
        setTestimonials(INITIAL_TESTIMONIALS);
      }
    } else {
      setTestimonials(INITIAL_TESTIMONIALS);
      localStorage.setItem("jstore_testimonials", JSON.stringify(INITIAL_TESTIMONIALS));
    }
  }, []);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim() || !formQuote.trim()) {
      setFormError("Semua formulir wajib diisi!");
      return;
    }

    const newReview: Testimonial = {
      id: `testi-${Date.now()}`,
      name: formName,
      role: formRole,
      quote: formQuote,
      rating: formRating,
      date: new Date().toISOString().split("T")[0],
      avatarSeed: formName.toLowerCase().replace(/\s+/g, "-")
    };

    const updated = [newReview, ...testimonials];
    setTestimonials(updated);
    localStorage.setItem("jstore_testimonials", JSON.stringify(updated));

    // Reset Form & Close
    setFormName("");
    setFormRole("");
    setFormQuote("");
    setFormRating(5);
    setFormError("");
    setIsModalOpen(false);
  };

  // Calculations for stats
  const totalReviews = testimonials.length;
  const averageRating = totalReviews > 0
    ? (testimonials.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const getStarCount = (star: number) => {
    return testimonials.filter(t => t.rating === star).length;
  };

  const filteredTestimonials = testimonials.filter(item => {
    const matchesRating = filterRating === "all" || item.rating === filterRating;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.quote.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesSearch;
  });

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 pt-12 md:pt-16">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-fuchsia-600/5 blur-[130px] pointer-events-none" />

      <div className="container-jstore">
        {/* Header Section */}
        <SectionReveal>
          <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                💬 Ulasan Jujur Pelanggan Setia
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Apa Kata <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Mereka?</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                Kami sangat bangga melayani ribuan transaksi langganan premium dengan tingkat kepuasan tinggi. Lihat ulasan asli pelanggan kami di bawah ini.
              </p>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 font-bold text-foreground shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] cursor-pointer self-center md:self-end shrink-0"
            >
              <Plus size={18} /> Tulis Testimoni Anda
            </button>
          </div>
        </SectionReveal>

        {/* Rating Statistics Dashboard */}
        <SectionReveal delay={0.05}>
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {/* Left Stat Box */}
            <div className="card-jstore p-6 border border-border bg-card backdrop-blur-md flex flex-col justify-center items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                <Award size={26} />
              </div>
              <span className="text-4xl font-extrabold text-foreground">{averageRating}</span>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= Math.round(Number(averageRating)) ? "text-amber-400 fill-amber-400" : "text-gray-600"}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground mt-2">Rata-rata rating dari {totalReviews} ulasan</span>
            </div>

            {/* Middle Bar Distribution */}
            <div className="card-jstore p-6 border border-border bg-card backdrop-blur-md md:col-span-2 flex flex-col justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Distribusi Rating Bintang</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = getStarCount(star);
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-12 text-muted-foreground font-medium flex items-center gap-1">
                        {star} <Star size={12} className="text-amber-400 fill-amber-400" />
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Filters and Search Bar */}
        <SectionReveal delay={0.08}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterRating("all")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  filterRating === "all"
                    ? "border-violet-500/50 bg-card text-foreground"
                    : "border-border bg-white/[0.01] hover:bg-white/[0.03] text-muted-foreground hover:text-foreground"
                }`}
              >
                Semua Ulasan
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(star)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                    filterRating === star
                      ? "border-violet-500/50 bg-card text-foreground"
                      : "border-border bg-white/[0.01] hover:bg-white/[0.03] text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {star} <Star size={12} className="fill-current text-amber-400" />
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari kata kunci ulasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-gray-500 outline-none focus:border-violet-500/30 transition-all"
              />
            </div>
          </div>
        </SectionReveal>

        {/* Testimonials List Grid */}
        <SectionReveal delay={0.1}>
          <div>
            {filteredTestimonials.length === 0 ? (
              <div className="card-jstore border border-border bg-card py-16 text-center">
                <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-muted-foreground font-semibold">Tidak ada testimoni yang cocok</p>
                <p className="text-xs text-muted-foreground mt-1">Coba sesuaikan filter atau kata pencarian Anda.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredTestimonials.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.3 }}
                      className="card-jstore p-6 border border-border bg-card backdrop-blur-md relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Rating stars */}
                        <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} size={14} className="fill-amber-400" />
                          ))}
                          {Array.from({ length: 5 - item.rating }).map((_, i) => (
                            <Star key={i} size={14} className="text-gray-700" />
                          ))}
                        </div>

                        {/* Quote */}
                        <p className="mt-4 text-sm text-muted-foreground italic leading-relaxed">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>

                      {/* Author details */}
                      <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20 text-primary text-sm font-bold uppercase">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <cite className="not-italic">
                            <span className="font-bold text-foreground text-sm block flex items-center gap-1">
                              {item.name}
                              {item.rating === 5 && (
                                <CheckCircle2 size={12} className="text-primary fill-violet-400/15" />
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">{item.role}</span>
                          </cite>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </SectionReveal>
      </div>

      {/* Write a Review Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card dark:bg-[#0c0c10] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-10"
            >
              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-primary">
                  <Flame size={20} className="fill-violet-400/20" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Tulis Ulasan Anda</h3>
                  <p className="text-xs text-muted-foreground">Bagikan pengalaman belanja Anda di JStore</p>
                </div>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400 font-semibold text-center">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleAddReview} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama Anda..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder-gray-500 outline-none focus:border-violet-500/30 transition-all"
                  />
                </div>

                {/* Subtitle / Role */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wide">Pekerjaan / Instansi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mahasiswa, Freelancer..."
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder-gray-500 outline-none focus:border-violet-500/30 transition-all"
                  />
                </div>

                {/* Rating Pick */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wide">Rating Bintang</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-gray-700 hover:scale-110 active:scale-95 transition-all p-1 cursor-pointer"
                      >
                        <Star
                          size={28}
                          className={
                            star <= (hoverRating ?? formRating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-700"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wide">Ulasan Anda</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tulis ulasan jujur Anda tentang kualitas akun, garansi, atau pelayanan CS JStore..."
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder-gray-500 outline-none focus:border-violet-500/30 transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 rounded-xl bg-muted border border-border hover:bg-muted py-3 text-sm font-semibold text-foreground transition-all cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-foreground shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:scale-[1.01] transition-all cursor-pointer text-center"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
