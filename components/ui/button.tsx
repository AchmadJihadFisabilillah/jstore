"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

export function Button({ className, children, isLoading, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[13px] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-foreground transition duration-200 hover:bg-[var(--primary-hover)] active:scale-[0.97] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Processing..." : children}
    </button>
  );
}
