"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: "violet" | "emerald" | "indigo" | "amber" | "rose" | "teal" | "blue";
  href?: string;
  className?: string;
}

const ACCENT_STYLES = {
  violet: { icon: "bg-violet-500/10 text-primary border-violet-500/20", accent: "rgba(139, 92, 246, 0.6)" },
  emerald: { icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", accent: "rgba(52, 211, 153, 0.6)" },
  indigo: { icon: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", accent: "rgba(99, 102, 241, 0.6)" },
  amber: { icon: "bg-amber-500/10 text-amber-400 border-amber-500/20", accent: "rgba(245, 158, 11, 0.6)" },
  rose: { icon: "bg-rose-500/10 text-rose-400 border-rose-500/20", accent: "rgba(244, 63, 94, 0.6)" },
  teal: { icon: "bg-teal-500/10 text-teal-400 border-teal-500/20", accent: "rgba(20, 184, 166, 0.6)" },
  blue: { icon: "bg-blue-500/10 text-blue-400 border-blue-500/20", accent: "rgba(59, 130, 246, 0.6)" },
};

export function StatCard({ title, value, subtitle, icon, accent = "violet", href, className }: StatCardProps) {
  const styles = ACCENT_STYLES[accent];

  const content = (
    <div
      className={cn(
        "admin-card stat-card p-5 flex flex-col justify-between",
        href && "cursor-pointer hover:scale-[1.02] transition-transform duration-200",
        className
      )}
      style={{ "--stat-accent": styles.accent } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
        <div className={cn("admin-icon-badge border", styles.icon)}>
          {icon}
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-xl font-extrabold text-foreground leading-none tracking-tight">{value}</h3>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
