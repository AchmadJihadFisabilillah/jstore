"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface PackageComparisonProps {
  packages: any[];
}

export function PackageComparison({ packages }: PackageComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const togglePackage = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(pId => pId !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const selectedPackages = packages.filter(p => selectedIds.includes(p.id));

  return (
    <div className="mt-8 border border-border bg-card rounded-2xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Bandingkan Paket (Maks. 3)</h3>
      
      {/* Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {packages.map(pkg => {
          const isSelected = selectedIds.includes(pkg.id);
          const isDisabled = !isSelected && selectedIds.length >= 3;
          
          return (
            <button
              key={pkg.id}
              onClick={() => togglePackage(pkg.id)}
              disabled={isDisabled}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                isSelected 
                ? "bg-violet-600/20 border-violet-500 text-foreground" 
                : "bg-muted border-border text-muted-foreground hover:text-foreground"
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSelected && <Check size={14} className="inline mr-1" />}
              {pkg.name}
            </button>
          );
        })}
      </div>

      {/* Comparison Table */}
      {selectedPackages.length > 0 && (
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-3 border-b border-border text-muted-foreground font-semibold w-1/4">Spesifikasi</th>
                {selectedPackages.map(pkg => (
                  <th key={pkg.id} className="p-3 border-b border-border text-foreground font-bold w-1/4">
                    <div className="flex items-center justify-between">
                      {pkg.name}
                      <button onClick={() => togglePackage(pkg.id)} className="text-muted-foreground hover:text-red-400">
                        <X size={16} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="p-3 border-b border-border text-muted-foreground">Harga</td>
                {selectedPackages.map(pkg => (
                  <td key={pkg.id} className="p-3 border-b border-border font-bold text-primary">
                    {formatRupiah(pkg.price)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border-b border-border text-muted-foreground">Durasi Aktif</td>
                {selectedPackages.map(pkg => (
                  <td key={pkg.id} className="p-3 border-b border-border text-muted-foreground">
                    {pkg.duration} Hari
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border-b border-border text-muted-foreground">Garansi</td>
                {selectedPackages.map(pkg => (
                  <td key={pkg.id} className="p-3 border-b border-border text-muted-foreground">
                    {pkg.warranty || "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border-b border-border text-muted-foreground">Status Stok</td>
                {selectedPackages.map(pkg => (
                  <td key={pkg.id} className={`p-3 border-b border-border ${pkg.stockStatus === "Habis" ? "text-red-400" : "text-emerald-400"}`}>
                    {pkg.stockStatus || "Tersedia"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
