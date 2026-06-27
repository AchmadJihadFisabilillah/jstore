"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const variantStyles = {
    danger: {
      icon: "bg-rose-500/10 text-rose-400",
      button: "bg-rose-600 hover:bg-rose-500 focus:ring-rose-500/30",
    },
    warning: {
      icon: "bg-amber-500/10 text-amber-400",
      button: "bg-amber-600 hover:bg-amber-500 focus:ring-amber-500/30",
    },
    info: {
      icon: "bg-violet-500/10 text-primary",
      button: "bg-violet-600 hover:bg-violet-500 focus:ring-violet-500/30",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ animation: "adminFadeIn 0.2s ease" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl border border-border bg-[#0c0c12] p-6 shadow-2xl shadow-black/50"
        style={{ animation: "adminSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4", styles.icon)}>
            <AlertTriangle size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">{description}</p>
        </div>

        {children && <div className="mt-4 w-full">{children}</div>}

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground bg-muted border border-border hover:bg-muted hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-foreground transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2",
              styles.button
            )}
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
