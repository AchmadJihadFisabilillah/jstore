import { AdminLoginForm } from "@/components/sections/admin-login-form";
import { SectionReveal } from "@/components/shared/section-reveal";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center py-16 px-4 overflow-hidden bg-[#050508]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="absolute top-0 right-0 h-96 w-96 -z-10 bg-indigo-500/5 blur-[120px]" />

      <div className="w-full max-w-md">
        <SectionReveal>
          <div className="card-jstore border border-border bg-[#09090e]/60 backdrop-blur-xl p-8 flex flex-col shadow-2xl rounded-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3.5 bg-violet-950/40 rounded-2xl border border-violet-500/20 mb-4">
                <ShieldCheck size={28} className="text-primary" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Portal Administrator</h1>
              <p className="mt-2 text-xs text-muted-foreground">
                Gunakan akun staf terdaftar Anda untuk mengelola platform JStore.
              </p>
            </div>

            <AdminLoginForm />

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                ← Kembali ke Beranda
              </Link>
              <span className="flex items-center gap-1">
                <ShieldAlert size={12} className="text-amber-500" /> Area Terproteksi
              </span>
            </div>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}
