import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import Image from "next/image";
import PaymentForm from "./payment-form"; // Client component

export default async function PembayaranPage({
  params,
}: {
  params: Promise<{ invoice: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { invoice } = await params;

  const order = await prisma.order.findUnique({
    where: { invoiceNo: invoice },
    include: {
      package: { include: { product: true } },
      payment: true,
    },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const payment = order.payment;
  if (!payment) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-screen text-white">
        <div className="max-w-2xl mx-auto bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h1 className="text-2xl font-bold mb-4">Pembayaran Tidak Ditemukan</h1>
          <p className="text-gray-400">Terjadi kesalahan pada sistem pembayaran.</p>
        </div>
      </div>
    );
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen text-white pb-24">
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Kolom Info & QRIS */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
            <h1 className="text-xl font-bold mb-2">Detail Pesanan</h1>
            <div className="text-sm text-gray-400 mb-6">Invoice: {order.invoiceNo}</div>
            
            <div className="flex gap-4 items-center mb-6">
              {order.package.product.logoUrl && (
                <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                  <Image 
                    src={order.package.product.logoUrl} 
                    alt={order.package.product.name} 
                    fill 
                    className="object-contain p-2" 
                  />
                </div>
              )}
              <div>
                <div className="font-semibold">{order.package.product.name}</div>
                <div className="text-sm text-gray-400">{order.package.name}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-t border-gray-800">
              <span className="text-gray-400">Total Pembayaran</span>
              <span className="text-xl font-bold text-magenta-500">
                {formatRupiah(payment.amount)}
              </span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl text-center">
            <h2 className="text-lg font-semibold mb-4">Scan QRIS</h2>
            {payment.qrImageUrl ? (
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <Image 
                  src={payment.qrImageUrl} 
                  alt="QRIS Payment" 
                  width={250} 
                  height={250} 
                  className="mx-auto"
                />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl mb-4">
                QRIS tidak tersedia
              </div>
            )}
            <p className="text-sm text-gray-400">
              Gunakan aplikasi e-wallet atau m-banking Anda untuk memindai QRIS di atas.
            </p>
          </div>
        </div>

        {/* Kolom Upload Bukti */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl flex flex-col">
          <h2 className="text-lg font-semibold mb-6">Konfirmasi Pembayaran</h2>
          <PaymentForm payment={payment} order={order} />
        </div>
      </div>
    </div>
  );
}
