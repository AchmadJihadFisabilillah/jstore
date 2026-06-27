"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Star } from "lucide-react";

const items = [
  { icon: Star, text: "⭐ Rating tinggi pelanggan", desc: "Ulasan positif dan repeat order tinggi." },
  { icon: ShieldCheck, text: "🔒 100% aman", desc: "Transaksi terproteksi dan akun tervalidasi." },
  { icon: Zap, text: "⚡ Proses cepat", desc: "Order diproses cepat tanpa langkah ribet." },
  { icon: ShieldCheck, text: "🛡️ Garansi akun", desc: "Klaim garansi aktif sesuai masa paket." },
];

export function TrustStrip() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.text}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          className="card-jstore card-hover p-5"
        >
          <item.icon className="mb-2 text-[var(--primary)]" />
          <p className="font-medium">{item.text}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
