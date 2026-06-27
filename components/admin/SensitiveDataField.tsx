"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface SensitiveDataFieldProps {
  label: string;
  value: string | null | undefined;
  masked?: string;
  onReveal?: () => Promise<string | null>;
  autoHideSeconds?: number;
  className?: string;
}

export function SensitiveDataField({
  label,
  value,
  masked = "••••••••",
  onReveal,
  autoHideSeconds = 30,
  className,
}: SensitiveDataFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [revealedValue, setRevealedValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayValue = revealed ? (revealedValue || value) : masked;
  const hasValue = !!(value || revealedValue);

  // Auto-hide after specified seconds
  useEffect(() => {
    if (revealed && autoHideSeconds > 0) {
      const timer = setTimeout(() => {
        setRevealed(false);
        setRevealedValue(null);
      }, autoHideSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [revealed, autoHideSeconds]);

  const handleReveal = useCallback(async () => {
    if (revealed) {
      setRevealed(false);
      setRevealedValue(null);
      return;
    }

    if (onReveal) {
      setLoading(true);
      try {
        const val = await onReveal();
        setRevealedValue(val);
        setRevealed(true);
      } catch (err) {
        console.error("Failed to reveal:", err);
      } finally {
        setLoading(false);
      }
    } else if (value) {
      setRevealed(true);
    }
  }, [revealed, onReveal, value]);

  const handleCopy = useCallback(async () => {
    const textToCopy = revealedValue || value;
    if (!textToCopy) return;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [revealedValue, value]);

  if (!hasValue && !onReveal) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-[10px] text-zinc-600 uppercase tracking-wide font-semibold w-20 shrink-0">{label}</span>
        <span className="text-xs text-zinc-600 italic">—</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <span className="text-[10px] text-zinc-600 uppercase tracking-wide font-semibold w-20 shrink-0">{label}</span>
      <span
        className={cn(
          "text-xs font-mono flex-1 min-w-0 truncate px-2 py-1 rounded-lg border border-border bg-card",
          revealed ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {loading ? "Memuat..." : displayValue}
      </span>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleReveal}
          disabled={loading}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
          title={revealed ? "Sembunyikan" : "Tampilkan"}
        >
          {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        {revealed && (
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            title={copied ? "Tersalin!" : "Salin"}
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}
