"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-semibold cursor-pointer transition"
    >
      <Printer size={14} /> Cetak PDF / Laporan
    </button>
  );
}
