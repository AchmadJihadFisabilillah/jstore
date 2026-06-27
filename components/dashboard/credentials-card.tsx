"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy, CheckCircle2, AlertCircle } from "lucide-react";

interface CredentialsCardProps {
  orderId: string;
  maskedEmail?: string | null;
  hasPin: boolean;
  hasCode: boolean;
  hasLink: boolean;
}

export function CredentialsCard({ orderId, maskedEmail, hasPin, hasCode, hasLink }: CredentialsCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  // Timeout effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isVisible) {
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 30000); // 30 seconds timeout
    }
    return () => clearTimeout(timeout);
  }, [isVisible]);

  const handleToggleVisibility = async () => {
    if (isVisible) {
      setIsVisible(false);
      return;
    }

    if (!data) {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/user/subscriptions/${orderId}/credentials`);
        if (!res.ok) throw new Error("Gagal memuat data");
        const json = await res.json();
        setData(json);
        setIsVisible(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsVisible(true);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const maskText = (text: string | null | undefined) => {
    if (!text) return "-";
    return "•".repeat(Math.min(10, text.length));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-[40px] rounded-full pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-base font-bold text-foreground">Detail Login Akun</h2>
        <button 
          onClick={handleToggleVisibility}
          disabled={isLoading}
          className="flex items-center gap-2 text-xs font-semibold bg-muted hover:bg-muted text-foreground px-3 py-1.5 rounded-lg transition-colors border border-border"
        >
          {isLoading ? (
            <span className="animate-pulse">Memuat...</span>
          ) : isVisible ? (
            <><EyeOff size={14} /> Sembunyikan</>
          ) : (
            <><Eye size={14} /> Tampilkan Data</>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="space-y-4 relative z-10">
        {/* Email Field */}
        {(maskedEmail || data?.email) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white/[0.02] border border-border rounded-xl">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Email / Username</p>
              <p className="text-sm font-medium text-foreground font-mono">
                {isVisible && data?.email ? data.email : (maskedEmail || "********")}
              </p>
            </div>
            {isVisible && data?.email && (
              <button 
                onClick={() => copyToClipboard(data.email, 'email')}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedField === 'email' ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        )}

        {/* Password Field */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white/[0.02] border border-border rounded-xl">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Password</p>
            <p className="text-sm font-medium text-foreground font-mono">
              {isVisible && data?.password ? data.password : "••••••••••"}
            </p>
          </div>
          {isVisible && data?.password && (
            <button 
              onClick={() => copyToClipboard(data.password, 'password')}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedField === 'password' ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        {/* PIN / Profile Field */}
        {(hasPin || data?.pin || data?.profile) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-between p-3 bg-white/[0.02] border border-border rounded-xl">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Profile Name</p>
                <p className="text-sm font-medium text-foreground">
                  {isVisible && data?.profile ? data.profile : (data?.profile ? maskText(data.profile) : "-")}
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-3 bg-white/[0.02] border border-border rounded-xl">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">PIN Profile</p>
                <p className="text-sm font-medium text-foreground font-mono">
                  {isVisible && data?.pin ? data.pin : (hasPin ? "••••" : "-")}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Redeem Code or Link */}
        {(hasCode || hasLink || data?.code || data?.link) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white/[0.02] border border-border rounded-xl">
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Kode Redeem / Link Aktivasi</p>
              <p className="text-sm font-medium text-foreground font-mono truncate">
                {isVisible && (data?.code || data?.link) ? (data.code || data.link) : "••••••••••••••••"}
              </p>
            </div>
            {isVisible && (data?.code || data?.link) && (
              <button 
                onClick={() => copyToClipboard(data.code || data.link, 'code')}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedField === 'code' ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        )}

        {isVisible && data?.notes && (
          <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">Catatan Admin</p>
            <p className="text-xs text-muted-foreground">{data.notes}</p>
          </div>
        )}
      </div>

      {isVisible && (
        <div className="mt-4 flex items-center gap-2 text-[10px] text-amber-400/80 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
          <AlertCircle size={12} />
          <span>Data ini bersifat rahasia. Jangan berikan kepada siapapun. Tampilan akan disembunyikan otomatis dalam 30 detik.</span>
        </div>
      )}
    </div>
  );
}
