"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getProductColor } from "@/lib/utils/logo-mapping";

interface ProductLogoProps {
  name: string;
  logoUrl?: string | null;
  dominantColor?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  xs: { container: "h-7 w-7", text: "text-[9px]", img: 24 },
  sm: { container: "h-9 w-9", text: "text-[10px]", img: 32 },
  md: { container: "h-11 w-11", text: "text-xs", img: 40 },
  lg: { container: "h-14 w-14", text: "text-sm", img: 52 },
  xl: { container: "h-24 w-24", text: "text-xl", img: 80 },
};

export function ProductLogo({ name, logoUrl, dominantColor, size = "sm", className }: ProductLogoProps) {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size];
  const color = dominantColor || getProductColor(name);

  // Generate initials (max 2 chars)
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!logoUrl || hasError) {
    return (
      <div
        className={cn(
          sizeConfig.container,
          "rounded-xl flex items-center justify-center font-bold shrink-0 border border-border",
          sizeConfig.text,
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          color: color,
        }}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeConfig.container,
        "rounded-xl overflow-hidden shrink-0 bg-muted border border-border flex items-center justify-center",
        className
      )}
      title={name}
    >
      <Image
        src={logoUrl}
        alt={`Logo ${name}`}
        width={sizeConfig.img}
        height={sizeConfig.img}
        className="object-contain w-full h-full p-1"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}
