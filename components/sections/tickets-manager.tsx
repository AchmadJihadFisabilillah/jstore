"use client";

import { useEffect, useState, useRef } from "react";
import { Ticket, Search, X, Loader2, MessageSquare, Send, UserCheck, ShieldAlert, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  ticketNo: string;
  userId: string;
  orderId: string | null;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  adminId: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  messages: Message[];
  order?: {
    invoiceNo: string | null;
    package: {
      name: string;
      product: {
        name: string;
      };
    };
    digitalStock?: {
      email: string | null;
      notes: string | null;
    } | null;
  } | null;
}

export function TicketsManager() {
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<TicketDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("NEW");
  
  // Reply State
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let query = "?";
      if (statusFilter) query += `status=${statusFilter}&`;
      const res = await fetch(`/api/admin/tickets${query}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTicketDetails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketDetails?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticketDetails) return;

    setReplyLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });

      if (res.ok) {
        setReplyText("");
        fetchTicketDetails(ticketDetails.id);
        fetchTickets(); // Refresh list count/status
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleClaimTicket = async () => {
    if (!ticketDetails) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignToMe: true }),
      });
      if (res.ok) {
        fetchTicketDetails(ticketDetails.id);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveTicket = async () => {
    if (!ticketDetails) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      if (res.ok) {
        setSelectedTicketId(null);
        setTicketDetails(null);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWarrantyExchange = async () => {
    if (!ticketDetails) return;
    if (!confirm("Apakah Anda yakin ingin melakukan pergantian akun otomatis untuk komplain klaim garansi ini?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "warranty_exchange" }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Garansi sukses diproses! Akun baru berhasil dikaitkan.");
        fetchTicketDetails(ticketDetails.id);
        fetchTickets();
      } else {
        alert(data.message || "Gagal melakukan pergantian garansi.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case "HIGH":
      case "URGENT":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-500/10 text-muted-foreground border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex admin-card p-4 justify-between">
        <div className="flex gap-2">
          {["NEW", "IN_PROGRESS", "WAITING_USER", "RESOLVED"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setSelectedTicketId(null);
                setTicketDetails(null);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                statusFilter === status
                  ? "bg-violet-600 border-violet-500 text-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "NEW" ? "Baru" : status === "IN_PROGRESS" ? "Diproses" : status === "WAITING_USER" ? "Menunggu User" : "Selesai"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Ticket lists & chat logs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ticket lists (1/3 width) */}
        <div className="admin-card divide-y divide-white/5 h-[32rem] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="animate-spin text-primary mr-2" size={16} /> Memuat tiket...
            </div>
          ) : tickets.length === 0 ? (
            <p className="admin-empty-state">Tidak ada tiket di kategori ini.</p>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`p-4 cursor-pointer text-xs space-y-1.5 transition text-left ${
                  selectedTicketId === t.id ? "bg-violet-600/10 border-l-2 border-violet-500" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-foreground">#{t.ticketNo}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${getPriorityBadge(t.priority)}`}>
                    {t.priority}
                  </span>
                </div>
                
                <div>
                  <p className="font-bold text-foreground truncate">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">Kategori: {t.category}</p>
                </div>

                <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1">
                  <span>Oleh: {t.user.name}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Conversation Logs (2/3 width) */}
        <div className="admin-card lg:col-span-2 flex flex-col justify-between h-[32rem] overflow-hidden">
          {!selectedTicketId ? (
            <div className="flex flex-col items-center justify-center py-28 text-muted-foreground gap-2 flex-1">
              <MessageSquare size={36} className="text-zinc-700" />
              Pilih tiket di sebelah kiri untuk melihat pesan komplain.
            </div>
          ) : detailsLoading || !ticketDetails ? (
            <div className="flex items-center justify-center flex-1 text-muted-foreground">
              <Loader2 className="animate-spin text-primary mr-2" size={16} /> Memuat log pesan komplain...
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              {/* Chat details header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-card bg-gradient-to-r from-zinc-950 to-transparent">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-foreground text-sm">#{ticketDetails.ticketNo}</span>
                    <span className="text-muted-foreground font-semibold">{ticketDetails.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Komplain Kategori: <strong className="text-foreground">{ticketDetails.category}</strong> • Pelanggan: {ticketDetails.user.name}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!ticketDetails.adminId && (
                    <Button onClick={handleClaimTicket} disabled={actionLoading} className="py-1 px-3 text-xs bg-muted border border-border hover:bg-muted flex items-center gap-1">
                      <UserCheck size={12} /> Ambil Tiket
                    </Button>
                  )}

                  {ticketDetails.orderId && (
                    <button
                      onClick={handleWarrantyExchange}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-foreground rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <Award size={12} /> Tukar Garansi (Ganti Akun)
                    </button>
                  )}

                  {ticketDetails.status !== "RESOLVED" && (
                    <button
                      onClick={handleResolveTicket}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-foreground rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <CheckCircle size={12} /> Selesaikan
                    </button>
                  )}
                </div>
              </div>

              {/* Chat list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-card">
                {/* Initial Description */}
                <div className="p-3 bg-card rounded-xl border border-border max-w-lg">
                  <span className="text-[10px] font-extrabold text-primary uppercase">Aduan Pelanggan</span>
                  <p className="text-foreground text-xs font-semibold mt-1">{ticketDetails.description}</p>
                  <span className="text-[9px] text-muted-foreground block mt-2">
                    Dikirim pada: {new Date(ticketDetails.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Messages history */}
                {ticketDetails.messages.map((m) => {
                  const isStaff = m.senderId !== ticketDetails.userId;
                  const isSystemMsg = m.message.includes("[KLAIM GARANSI DISETUJUI]");
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isStaff ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`p-3 rounded-xl max-w-sm text-xs leading-normal ${
                          isSystemMsg
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold"
                            : isStaff
                            ? "bg-violet-600 text-foreground rounded-tr-none font-medium"
                            : "bg-muted text-foreground rounded-tl-none"
                        }`}
                      >
                        <p>{m.message}</p>
                        <span className={`text-[8px] block mt-1.5 text-right ${isStaff ? "text-violet-200" : "text-muted-foreground"}`}>
                          {new Date(m.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat reply box */}
              {ticketDetails.status !== "RESOLVED" && (
                <form onSubmit={handleSendReply} className="p-3 bg-card border-t border-border flex gap-2">
                  <Input
                    required
                    placeholder="Ketik balasan untuk pelanggan..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={replyLoading}
                  />
                  <Button type="submit" className="px-4 shrink-0 flex items-center justify-center" isLoading={replyLoading}>
                    <Send size={14} />
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
