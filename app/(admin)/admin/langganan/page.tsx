import { prisma } from "@/lib/prisma/client";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Repeat, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: true,
      package: { include: { product: true } },
    },
    orderBy: { endDate: "asc" }
  });

  const activeCount = subscriptions.filter((s: any) => s.status === "ACTIVE").length;
  const expiringCount = subscriptions.filter((s: any) => s.status === "EXPIRING").length;
  const expiredCount = subscriptions.filter((s: any) => s.status === "EXPIRED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Repeat size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Manajemen Langganan</h1>
          <p className="text-xs text-muted-foreground mt-1">Pantau seluruh pelanggan aktif dan retensi langganan (Recurring Revenue).</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-jstore p-5 border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-emerald-400">Langganan Aktif</span>
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground">{activeCount}</h3>
          <p className="text-[10px] text-muted-foreground mt-1">Pengguna dengan layanan berjalan lancar</p>
        </div>

        <div className="card-jstore p-5 border border-amber-500/20 bg-amber-500/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-amber-400">Akan Berakhir (H-7)</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground">{expiringCount}</h3>
          <p className="text-[10px] text-muted-foreground mt-1">Perlu pengingat perpanjangan</p>
        </div>

        <div className="card-jstore p-5 border border-rose-500/20 bg-rose-500/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-rose-400">Kedaluwarsa</span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground">{expiredCount}</h3>
          <p className="text-[10px] text-muted-foreground mt-1">Gagal perpanjang / berhenti langganan</p>
        </div>
      </div>

      {/* Table */}
      <div className="card-jstore border border-border bg-[#09090e]/60 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-bold bg-card">
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Layanan Premium</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Mulai Langganan</th>
              <th className="p-4 text-center">Jatuh Tempo</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">Belum ada data langganan.</td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border hover:bg-muted transition">
                  <td className="p-4">
                    <div className="font-bold text-foreground">{sub.user.name || "Anonim"}</div>
                    <div className="text-muted-foreground text-[10px] mt-0.5">{sub.user.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-primary">{sub.package.product.name}</div>
                    <div className="text-muted-foreground text-[10px] mt-0.5">{sub.package.name}</div>
                  </td>
                  <td className="p-4 text-center">
                    {sub.status === "ACTIVE" ? (
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold text-[9px]">AKTIF</span>
                    ) : sub.status === "EXPIRING" ? (
                      <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold text-[9px]">EXPIRING</span>
                    ) : (
                      <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-bold text-[9px]">EXPIRED</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    {format(new Date(sub.startDate), "d MMM yyyy", { locale: localeId })}
                  </td>
                  <td className="p-4 text-center text-foreground font-semibold">
                    {format(new Date(sub.endDate), "d MMM yyyy", { locale: localeId })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
