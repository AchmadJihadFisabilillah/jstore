import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm outline-none ring-[var(--primary)] placeholder:text-muted-foreground focus:ring-2",
        props.className
      )}
    />
  );
}
