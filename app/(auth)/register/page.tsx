import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { RegisterForm } from "@/components/sections/register-form";
import { SectionReveal } from "@/components/shared/section-reveal";

export default function RegisterPage() {
  return (
    <main className="relative min-h-[85vh] flex items-center justify-center py-16 px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[130px]" />

      <div className="w-full max-w-4xl">
        <SectionReveal>
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {/* Left Card: Form */}
            <div className="card-jstore border border-border bg-card backdrop-blur-md p-8 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Daftar Akun JStore</h1>
                <p className="mt-2 text-sm text-muted-foreground">Buat akun untuk mendapatkan harga premium terbaik.</p>
                <div className="mt-8">
                  <RegisterForm />
                </div>
              </div>
              
              <p className="mt-8 text-sm text-muted-foreground text-center md:text-left">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-primary transition-colors">
                  Masuk di sini
                </Link>
              </p>
            </div>

            {/* Right Card: Info */}
            <div className="card-jstore border border-border bg-gradient-to-br from-[#0d0d12]/60 to-[#12121e]/40 backdrop-blur-md p-8 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 -z-10 bg-violet-500/5 blur-2xl" />
              
              <h2 className="text-xl font-bold text-foreground mb-6">Keuntungan Anggota JStore</h2>
              
              <ul className="space-y-4">
                {[
                  { title: "Proses Transaksi Cepat", desc: "Akses alur checkout satu halaman yang didukung pembayaran otomatis Mandiri QRIS." },
                  { title: "Laporan & Riwayat", desc: "Pantau produk aktif Anda serta catat transaksi Anda dengan rapi di satu dashboard." },
                  { title: "Klaim Garansi Instan", desc: "Lakukan pengaduan kendala akun atau reset password dengan garansi penuh selama masa sewa." }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-1 text-primary shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}

