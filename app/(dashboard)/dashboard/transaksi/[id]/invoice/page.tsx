import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { formatRupiah } from "@/lib/utils";
import { Printer } from "lucide-react";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { 
      id,
    },
    include: {
      package: { include: { product: true } },
      user: true,
      payment: true
    }
  });

  if (!order || order.userId !== session.user.id || order.status !== "PAID") {
    redirect("/dashboard/transaksi");
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans print:p-0">
      <div className="max-w-3xl mx-auto border border-gray-200 rounded-lg p-10 print:border-none print:p-0 print:m-0 shadow-sm print:shadow-none bg-white">
        
        {/* Print Button (Hidden on Print) */}
        <div className="flex justify-end mb-8 print:hidden">
           <button 
             id="print-btn" 
             className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-foreground px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
           >
             <Printer size={18} /> Cetak Invoice
           </button>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-12 border-b border-gray-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-violet-600 text-foreground font-bold flex items-center justify-center rounded-md">J</div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">JSTORE</h1>
            </div>
            <p className="text-sm text-muted-foreground">Premium Digital Accounts & Services</p>
            <p className="text-sm text-muted-foreground mt-1">support@jstore.id | jstore.id</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h2>
            <p className="text-sm font-medium text-gray-600 mt-2">#{order.invoiceNo || order.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tanggal: {order.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full uppercase tracking-wider">
              Lunas
            </span>
          </div>
        </div>

        {/* Customer & Order Details */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Ditagihkan Kepada:</h3>
            <p className="font-bold text-gray-900">{order.user.name}</p>
            <p className="text-sm text-gray-600 mt-1">{order.user.email}</p>
            {order.whatsapp && <p className="text-sm text-gray-600 mt-1">{order.whatsapp}</p>}
          </div>
          <div className="text-right">
             <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Informasi Pembayaran:</h3>
             <p className="text-sm text-gray-600">Metode: <span className="font-medium text-gray-900">Otomatis / QRIS</span></p>
             <p className="text-sm text-gray-600 mt-1">Status: <span className="font-medium text-gray-900">Berhasil Diverifikasi</span></p>
             {order.payment?.providerTransactionId && (
               <p className="text-xs text-muted-foreground mt-2 font-mono">Ref: {order.payment.providerTransactionId}</p>
             )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-3 font-bold text-gray-700">Deskripsi Layanan</th>
                <th className="px-4 py-3 font-bold text-gray-700 text-center">Durasi</th>
                <th className="px-4 py-3 font-bold text-gray-700 text-right">Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-5">
                  <p className="font-bold text-gray-900">{order.package.product.name}</p>
                  <p className="text-muted-foreground mt-1">{order.package.name}</p>
                </td>
                <td className="px-4 py-5 text-center text-gray-700">
                  {order.package.duration} Hari
                </td>
                <td className="px-4 py-5 text-right font-medium text-gray-900">
                  {formatRupiah(order.package.price)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Calculation */}
        <div className="flex justify-end mb-16">
          <div className="w-1/2">
            <div className="flex justify-between py-2 text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatRupiah(order.package.price)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200 mb-2">
              <span>Biaya Admin</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold text-gray-900">
              <span>Total Akhir</span>
              <span className="text-violet-700">{formatRupiah(order.package.price)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-gray-900 mb-1">Terima kasih atas kepercayaan Anda berlangganan di JStore!</p>
          <p>Jika Anda memiliki pertanyaan mengenai invoice ini, silakan hubungi pusat bantuan kami.</p>
        </div>

        {/* Print script */}
        <script dangerouslySetInnerHTML={{__html: `
          document.getElementById('print-btn').onclick = function() { window.print(); }
        `}} />
      </div>
    </div>
  );
}
