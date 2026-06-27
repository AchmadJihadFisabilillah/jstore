import { prisma } from "@/lib/prisma/client";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";

export const metadata = {
  title: "Kelola Pembayaran - JStore Admin",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const { status } = await searchParams;
  const whereClause = status ? { status } : {};

  const payments = await prisma.payment.findMany({
    where: whereClause,
    include: {
      order: {
        include: {
          user: true,
          package: { include: { product: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case "WAITING_PAYMENT": return "bg-gray-800 text-gray-300";
      case "UNDER_REVIEW": return "bg-yellow-900/50 text-yellow-500 border border-yellow-800";
      case "APPROVED": return "bg-green-900/50 text-green-500 border border-green-800";
      case "REJECTED": return "bg-red-900/50 text-red-500 border border-red-800";
      default: return "bg-gray-800 text-gray-300";
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <CreditCard size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Pembayaran Manual QRIS</h1>
          <p className="text-xs text-muted-foreground mt-1">Validasi bukti transfer dan kelola pembayaran.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Link href="/admin/pembayaran" className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!status ? 'bg-magenta-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Semua</Link>
        <Link href="/admin/pembayaran?status=UNDER_REVIEW" className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${status === 'UNDER_REVIEW' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Perlu Verifikasi</Link>
        <Link href="/admin/pembayaran?status=WAITING_PAYMENT" className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${status === 'WAITING_PAYMENT' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Menunggu Bukti</Link>
        <Link href="/admin/pembayaran?status=APPROVED" className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${status === 'APPROVED' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Disetujui</Link>
        <Link href="/admin/pembayaran?status=REJECTED" className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Ditolak</Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/50 text-xs uppercase text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Produk</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data pembayaran ditemukan.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 font-medium text-white">{p.order.invoiceNo}</td>
                    <td className="px-6 py-4">
                      <div className="text-white">{p.order.user.name}</div>
                      <div className="text-xs text-gray-500">{p.order.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{p.order.package.product.name}</div>
                      <div className="text-xs text-gray-500">{p.order.package.name}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-magenta-400">{formatRupiah(p.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/pembayaran/${p.id}`}
                        className="text-magenta-500 hover:text-magenta-400 font-medium transition"
                      >
                        Verifikasi
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
