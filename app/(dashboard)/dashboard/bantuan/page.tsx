import { redirect } from "next/navigation";
import Link from "next/link";
import { LifeBuoy, Plus, Search, MessageSquare, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const dynamic = 'force-dynamic';

export default async function BantuanPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'NEW': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">BARU</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold">DIPROSES</span>;
      case 'WAITING_USER': return <span className="bg-violet-500/10 text-primary border border-violet-500/20 px-2 py-0.5 rounded text-[10px] font-bold">BUTUH BALASAN</span>;
      case 'RESOLVED': return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold">SELESAI</span>;
      case 'REJECTED': return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">DITOLAK</span>;
      default: return <span className="bg-gray-500/10 text-muted-foreground border border-gray-500/20 px-2 py-0.5 rounded text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Pusat Bantuan</h1>
          <p className="text-muted-foreground text-sm">Punya masalah dengan pesanan atau akun Anda? Kami siap membantu.</p>
        </div>
        <Link href="/dashboard/bantuan/buat" className="shrink-0 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-foreground px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-violet-900/20">
          <Plus size={18} /> Buat Tiket Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Riwayat Tiket</h2>
          
          {tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map(ticket => (
                <Link 
                  key={ticket.id}
                  href={`/dashboard/bantuan/${ticket.id}`}
                  className="block bg-card border border-border hover:border-border rounded-2xl p-5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">#{ticket.ticketNo}</span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {ticket.updatedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">{ticket.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-4">{ticket.description}</p>
                  
                  <div className="flex items-center justify-between text-xs border-t border-border pt-4">
                    <span className="text-muted-foreground">Kategori: {ticket.category.replace(/_/g, ' ')}</span>
                    <span className="text-primary font-medium flex items-center gap-1">
                      Lihat Detail <MessageSquare size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <MessageSquare className="text-muted-foreground" size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Belum ada tiket bantuan</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Anda belum pernah membuat tiket. Jika ada kendala, silakan klik tombol Buat Tiket Baru.
              </p>
            </div>
          )}
        </div>

        {/* FAQ Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-4">FAQ Cepat</h2>
            
            <div className="space-y-4">
              <div className="border-b border-border pb-4">
                <h4 className="text-sm font-bold text-foreground mb-1">Berapa lama proses pesanan?</h4>
                <p className="text-xs text-muted-foreground">Umumnya pesanan diproses dalam 5-15 menit. Maksimal 1x24 jam tergantung antrean.</p>
              </div>
              <div className="border-b border-border pb-4">
                <h4 className="text-sm font-bold text-foreground mb-1">Akun terkena screen limit?</h4>
                <p className="text-xs text-muted-foreground">Silakan buat tiket dengan kategori "Akun terkena limit" dan sertakan screenshot error.</p>
              </div>
              <div className="border-b border-border pb-4">
                <h4 className="text-sm font-bold text-foreground mb-1">Bagaimana cara klaim garansi?</h4>
                <p className="text-xs text-muted-foreground">Buat tiket dan pilih pesanan yang bermasalah. Pastikan tidak melanggar rules yang ada.</p>
              </div>
            </div>
            
            <Link href="/faq" className="block text-center text-xs text-primary hover:text-primary font-medium mt-4">
              Lihat Semua FAQ
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/20 border border-border rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 blur-[40px] rounded-full pointer-events-none"></div>
             <h2 className="text-base font-bold text-foreground mb-2 relative z-10">WhatsApp Support</h2>
             <p className="text-xs text-muted-foreground mb-4 relative z-10">Butuh respon cepat? Anda juga dapat menghubungi Customer Service kami via WhatsApp.</p>
             <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="block text-center bg-[#25D366] hover:bg-[#20bd5a] text-foreground px-4 py-2.5 rounded-xl font-bold text-sm transition-colors relative z-10">
               Chat WhatsApp
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
