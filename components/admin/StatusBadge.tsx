"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  // Stock statuses
  AVAILABLE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  RESERVED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SOLD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAULTY: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  REPLACED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  EXPIRED: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20",
  DISABLED: "bg-zinc-600/10 text-muted-foreground border-zinc-600/20",

  // Order statuses
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

  // Ticket statuses
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-violet-500/10 text-primary border-violet-500/20",
  WAITING_USER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",

  // Refund statuses
  UNDER_REVIEW: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REFUNDED: "bg-teal-500/10 text-teal-400 border-teal-500/20",

  // Priority
  LOW: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  URGENT: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Tersedia",
  RESERVED: "Direservasi",
  SOLD: "Terjual",
  FAULTY: "Bermasalah",
  REPLACED: "Diganti",
  EXPIRED: "Kedaluwarsa",
  DISABLED: "Nonaktif",
  PENDING: "Menunggu",
  PAID: "Lunas",
  NEW: "Baru",
  IN_PROGRESS: "Diproses",
  WAITING_USER: "Menunggu User",
  RESOLVED: "Selesai",
  REJECTED: "Ditolak",
  UNDER_REVIEW: "Dalam Review",
  APPROVED: "Disetujui",
  REFUNDED: "Dikembalikan",
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
  URGENT: "Darurat",
};

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || "bg-zinc-500/10 text-muted-foreground border-zinc-500/20";
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        "admin-badge border",
        style,
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
    >
      {label}
    </span>
  );
}
