"use client";

import { useState } from "react";
import { PaymentsManager } from "./payments-manager";
import { DigitalPaymentsManager } from "./digital-payments-manager";
import { CreditCard, QrCode } from "lucide-react";

export function AdminPaymentTabs() {
  const [activeTab, setActiveTab] = useState<"MANUAL" | "DIGITAL">("DIGITAL"); // Default to DIGITAL for Mandiri QRIS

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex border-b border-border pb-px gap-6">
        <button
          onClick={() => setActiveTab("DIGITAL")}
          className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer
            ${activeTab === "DIGITAL" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <QrCode size={14} /> Transaksi Digital Gateway
          {activeTab === "DIGITAL" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("MANUAL")}
          className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer
            ${activeTab === "MANUAL" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <CreditCard size={14} /> Verifikasi Transfer Manual
          {activeTab === "MANUAL" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Render selected manager */}
      <div className="animate-in fade-in duration-200">
        {activeTab === "DIGITAL" ? <DigitalPaymentsManager /> : <PaymentsManager />}
      </div>
    </div>
  );
}
