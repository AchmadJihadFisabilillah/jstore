import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, User, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const dynamic = 'force-dynamic';

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const ticket = await prisma.ticket.findUnique({
    where: { 
      id,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      },
      order: {
        include: { package: { include: { product: true } } }
      }
    }
  });

  if (!ticket || ticket.userId !== session.user.id) {
    redirect("/dashboard/bantuan");
  }

  const isClosed = ticket.status === "RESOLVED" || ticket.status === "REJECTED";

  return (
    <div className="space-y-6 max-w-4xl h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center gap-4 shrink-0">
        <Link href="/dashboard/bantuan" className="p-2 rounded-xl bg-muted hover:bg-muted text-foreground transition-colors border border-border">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
            Tiket #{ticket.ticketNo}
            <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-border">
              {ticket.status}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{ticket.title}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {ticket.messages.map((msg) => {
              const isAdmin = msg.senderId !== session.user.id;
              
              return (
                <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                    ${isAdmin ? 'bg-violet-600 text-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
                  </div>
                  
                  <div className={`max-w-[80%] ${isAdmin ? 'text-left' : 'text-right'}`}>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2 justify-end flex-row-reverse">
                      <span>{isAdmin ? 'Admin JStore' : 'Anda'}</span>
                      <span>•</span>
                      <span>{msg.createdAt.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-4 rounded-2xl whitespace-pre-wrap text-sm inline-block
                      ${isAdmin ? 'bg-violet-500/10 border border-violet-500/20 text-foreground rounded-tl-none' 
                                : 'bg-muted border border-border text-foreground rounded-tr-none'}`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Reply Form */}
          {!isClosed ? (
            <div className="p-4 border-t border-border bg-background/80 dark:bg-[#0a0a0f]/80 backdrop-blur-sm">
              <form 
                action={async (formData) => {
                  "use server";
                  const message = formData.get("message") as string;
                  if (!message.trim()) return;
                  
                  await prisma.ticketMessage.create({
                    data: {
                      ticketId: ticket.id,
                      senderId: session.user.id,
                      message: message,
                    }
                  });
                  await prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { status: "WAITING_ADMIN", updatedAt: new Date() }
                  });
                  // revalidatePath happens implicitly or on refresh, but server actions automatically revalidate in some setups
                }}
                className="flex gap-2"
              >
                <input 
                  type="text" 
                  name="message"
                  required
                  placeholder="Ketik balasan Anda..." 
                  className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button type="submit" className="shrink-0 w-12 h-12 bg-violet-600 hover:bg-violet-500 text-foreground rounded-xl flex items-center justify-center transition-colors">
                  <Send size={18} />
                </button>
              </form>
            </div>
          ) : (
             <div className="p-4 border-t border-border bg-red-500/5 text-center text-red-400 text-sm font-medium">
               Tiket ini telah ditutup dan tidak dapat menerima balasan lagi.
             </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="md:w-64 shrink-0 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Informasi Tiket</h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Dibuat pada</p>
                <p className="text-foreground font-medium">{ticket.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Kategori</p>
                <p className="text-foreground font-medium">{ticket.category.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Prioritas</p>
                <p className="text-foreground font-medium">{ticket.priority}</p>
              </div>
            </div>
          </div>

          {ticket.order && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Pesanan Terkait</h3>
              <div className="bg-muted rounded-xl p-3 border border-border">
                <p className="font-bold text-foreground text-sm mb-1">{ticket.order.package.product.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{ticket.order.package.name}</p>
                <Link href={`/dashboard/pesanan/${ticket.order.id}`} className="text-[10px] bg-violet-600 hover:bg-violet-500 text-foreground px-3 py-1.5 rounded-lg font-medium transition-colors inline-block w-full text-center">
                  Lihat Pesanan
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
