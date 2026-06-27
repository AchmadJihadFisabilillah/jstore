"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // Action buttons
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6", className)}>
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 mt-3 sm:mt-0 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
