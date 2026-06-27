import { prisma } from "@/lib/prisma/client";
import { getSession } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PaymentVerificationForm from "./payment-verification-form";
import { ChevronLeft } from "lucide-react";

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const { paymentId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          user: true,
          package: { include: { product: true } }
        }
      }
    }
  });

  if (!payment) {
    notFound();
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 text-gray-300 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/pembayaran" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Detail Verifikasi Pembayaran</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Informasi Transaksi</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice</span>
                <span className="font-bold text-white">{payment.order.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Waktu Order</span>
                <span className="text-white">{formatDate(payment.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-magenta-400">{payment.status}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-800 mt-2">
                <span className="text-gray-400">Total Tagihan</span>
                <span className="text-lg font-bold text-magenta-500">{formatRupiah(payment.amount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Informasi Customer</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nama Lengkap</span>
                <span className="font-bold text-white">{payment.order.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-white">{payment.order.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Produk</span>
                <span className="text-white text-right">{payment.order.package.product.name} <br/> ({payment.order.package.name})</span>
              </div>
            </div>
          </div>
          
          {payment.status === "REJECTED" && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
               <h2 className="text-lg font-bold text-red-500 mb-2">Penolakan Terakhir</h2>
               <p className="text-sm text-red-400">{payment.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4">Bukti Pembayaran</h2>
          
          {payment.proofUrl ? (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Pengirim</span>
                  <span className="font-medium text-white">{payment.senderName || "-"}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Aplikasi/Bank</span>
                  <span className="font-medium text-white">{payment.senderAccount || "-"}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Waktu Transfer</span>
                  <span className="font-medium text-white">{formatDate(payment.paymentTime)}</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-2 flex-1 relative min-h-[300px]">
                <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="absolute top-4 right-4 bg-black/50 p-2 rounded-lg text-white hover:bg-black/70 z-10" title="Buka Gambar">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
                <div className="relative w-full h-full min-h-[300px]">
                  <Image src={payment.proofUrl} alt="Bukti Transfer" fill className="object-contain" unoptimized />
                </div>
              </div>

              {payment.customerNote && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm border border-gray-700">
                  <span className="block text-gray-500 text-xs mb-1">Catatan Customer:</span>
                  <span className="text-gray-300 italic">"{payment.customerNote}"</span>
                </div>
              )}

              {payment.status === "UNDER_REVIEW" && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <PaymentVerificationForm paymentId={payment.id} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl p-6 text-center text-gray-500">
              Customer belum mengunggah bukti pembayaran.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
