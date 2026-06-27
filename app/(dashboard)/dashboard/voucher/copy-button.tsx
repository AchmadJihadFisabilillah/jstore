"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";

export function CopyButton({ code, disabled }: { code: string, disabled: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (disabled) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      disabled={disabled}
      className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-lg transition-colors
        ${disabled ? 'bg-muted text-gray-600 cursor-not-allowed' : 
          copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
          'bg-violet-600 hover:bg-violet-500 text-foreground shadow-lg shadow-violet-900/20'}`}
    >
      {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
    </button>
  );
}
