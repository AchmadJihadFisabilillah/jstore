"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("admin-empty-state py-12", className)}>
      <div className="opacity-30 mb-2">{icon}</div>
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      {description && <p className="text-xs text-zinc-600 mt-1 max-w-xs text-center">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message = "Terjadi kesalahan saat memuat data.", onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("admin-empty-state py-12", className)}>
      <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-xs font-semibold text-primary hover:text-primary transition-colors cursor-pointer"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("admin-skeleton", className)} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn(
                "h-5",
                j === 0 ? "w-10" : j === cols - 1 ? "w-20" : "flex-1"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
