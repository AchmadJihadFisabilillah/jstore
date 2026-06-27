"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-jstore section-space">
      <div className="mx-auto max-w-xl card-jstore p-8 text-center">
        <AlertTriangle className="mx-auto text-[var(--primary)]" size={30} />
        <h2 className="mt-3 text-xl font-bold">Ups, terjadi kendala</h2>
        <p className="mt-2 text-[var(--muted)]">Silakan coba ulang. Jika masih gagal, hubungi admin JStore.</p>
        <button
          onClick={reset}
          className="mt-5 rounded-[13px] bg-[var(--primary)] px-4 py-2.5 font-semibold text-foreground"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
