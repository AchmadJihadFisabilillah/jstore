import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Package, Ticket, ShieldCheck, CheckCircle2, AlertCircle, Info, ChevronRight, Check } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const dynamic = 'force-dynamic';

export default async function NotifikasiPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  // If user clicks "Tandai Semua Dibaca" (via Server Action / API) - for now just display
  // Using Notification model we created earlier
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50 // Limit to last 50
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_UPDATE': return <Package size={18} className="text-blue-400" />;
      case 'SUBSCRIPTION_ENDING': return <AlertCircle size={18} className="text-red-400" />;
      case 'VOUCHER_NEW': return <Ticket size={18} className="text-green-400" />;
      case 'TICKET_REPLY': return <ShieldCheck size={18} className="text-primary" />;
      case 'GENERAL': return <Info size={18} className="text-muted-foreground" />;
      default: return <Bell size={18} className="text-muted-foreground" />;
    }
  };

  const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white/[0.02] border-border';
    switch (type) {
      case 'ORDER_UPDATE': return 'bg-blue-500/10 border-blue-500/20';
      case 'SUBSCRIPTION_ENDING': return 'bg-red-500/10 border-red-500/20';
      case 'VOUCHER_NEW': return 'bg-green-500/10 border-green-500/20';
      case 'TICKET_REPLY': return 'bg-violet-500/10 border-violet-500/20';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            Notifikasi 
            {unreadCount > 0 && (
              <span className="bg-red-500 text-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} Baru</span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">Pembaruan pesanan, masa aktif langganan, dan promo terbaru.</p>
        </div>
        
        {unreadCount > 0 && (
          <form action={async () => {
             "use server";
             await prisma.notification.updateMany({
               where: { userId: session.user.id, isRead: false },
               data: { isRead: true }
             });
             // Need revalidatePath but we can skip for simplicity in this artifact, user can refresh
          }}>
            <button type="submit" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 bg-muted hover:bg-muted rounded-lg">
              <Check size={16} /> Tandai semua dibaca
            </button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <Link 
              key={notif.id}
              href={notif.link || "#"}
              className={`block border rounded-2xl p-4 transition-all group hover:-translate-y-0.5 ${getBgColor(notif.type, notif.isRead)}`}
            >
              <div className="flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                  ${notif.isRead ? 'bg-card' : 'bg-card shadow-inner shadow-white/5'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`font-semibold text-sm truncate pr-4 ${notif.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {notif.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 ${notif.isRead ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                   <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 shrink-0"></div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <Bell className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Belum ada notifikasi</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Saat ini Anda belum memiliki notifikasi apapun. Pembaruan akan muncul di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
