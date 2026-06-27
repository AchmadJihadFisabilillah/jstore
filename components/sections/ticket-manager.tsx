"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ShieldCheck, User, Send, Clock, X, MessageSquare, AlertCircle, RefreshCw, CheckCircle2, MoreVertical, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface TicketMessage {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNo: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  messages: TicketMessage[];
  orderId?: string | null;
  order?: {
    id: string;
    invoiceNo: string;
    package: {
      name: string;
      product: { name: string };
    };
    digitalStocks?: any[];
  };
}

export function TicketManager() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // States for interaction
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const url = filterStatus === "ALL" ? "/api/admin/tickets" : `/api/admin/tickets?status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const handleSelectTicket = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
        
        // If ticket is NEW, auto assign and set to IN_PROGRESS
        if (data.status === "NEW") {
           handleUpdateStatus(data.id, "IN_PROGRESS", true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string, assignToMe = false) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, assignToMe }),
      });
      if (res.ok) {
        fetchTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => prev ? {...prev, status: newStatus} : null);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    
    setIsReplying(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      
      if (res.ok) {
        const newMsg = await res.json();
        setSelectedTicket(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: "WAITING_USER",
            messages: [...prev.messages, newMsg]
          };
        });
        setReplyMessage("");
        fetchTickets(); // Refresh list to update status/time
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleWarrantyExchange = async () => {
    if (!selectedTicket || !selectedTicket.order) return;
    
    if (!confirm("PENTING: Sistem akan langsung mencari akun stok 'AVAILABLE' yang ada di gudang dan mengganti akun pelanggan yang bermasalah secara OTOMATIS. Apakah Anda yakin stok sudah disiapkan?")) {
      return;
    }

    setIsExchanging(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "warranty_exchange" }),
      });
      
      if (res.ok) {
        alert("Berhasil! Akun baru telah diberikan kepada pelanggan. Pesan konfirmasi telah dikirim ke dalam tiket otomatis oleh sistem.");
        // Reload ticket details to see the new system message and stock status
        handleSelectTicket(selectedTicket.id);
      } else {
        const error = await res.json();
        alert(`Gagal: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat mencoba Ganti Akun.");
    } finally {
      setIsExchanging(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'NEW': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-[0_0_10px_rgba(59,130,246,0.2)]">BARU</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.2)]">DIPROSES</span>;
      case 'WAITING_USER': return <span className="bg-muted text-muted-foreground border border-border px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">MENUNGGU PELANGGAN</span>;
      case 'WAITING_ADMIN': return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-[0_0_10px_rgba(244,63,94,0.2)] animate-pulse">PELANGGAN MEMBALAS</span>;
      case 'RESOLVED': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">SELESAI</span>;
      default: return <span className="bg-gray-500/10 text-muted-foreground border border-gray-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{status}</span>;
    }
  };

  const isClosed = selectedTicket?.status === "RESOLVED" || selectedTicket?.status === "REJECTED";

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      
      {/* Ticket List (Left Sidebar) */}
      <div className="w-full lg:w-[350px] shrink-0 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-[#0a0a0f]/80">
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
            {["ALL", "NEW", "WAITING_ADMIN", "IN_PROGRESS", "RESOLVED"].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                  filterStatus === st 
                    ? "bg-violet-600 text-foreground shadow-md shadow-violet-900/20" 
                    : "bg-muted text-muted-foreground hover:bg-muted"
                }`}
              >
                {st === "ALL" ? "SEMUA" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-2 space-y-2">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-3">
               <RefreshCw className="animate-spin" size={24} />
               <p className="text-xs">Memuat tiket...</p>
             </div>
          ) : tickets.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-3">
               <MessageSquare size={24} />
               <p className="text-xs">Tidak ada tiket di filter ini.</p>
             </div>
          ) : (
            tickets.map(t => (
              <button 
                key={t.id}
                onClick={() => handleSelectTicket(t.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTicket?.id === t.id 
                    ? "bg-violet-900/20 border-violet-500/50" 
                    : "bg-white/[0.02] border-border hover:border-border hover:bg-muted"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-muted-foreground font-mono">#{t.ticketNo}</span>
                  {getStatusBadge(t.status)}
                </div>
                <h4 className="font-bold text-foreground text-sm line-clamp-1 mb-1">{t.title}</h4>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                    <User size={12} /> {t.user.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {format(new Date(t.updatedAt), "HH:mm", { locale: localeId })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail (Right Main Content) */}
      <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden relative min-h-0">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-5 border-b border-border bg-[#0a0a0f]/80 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
                  Tiket #{selectedTicket.ticketNo}
                  {getStatusBadge(selectedTicket.status)}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span>Dari: <strong className="text-muted-foreground">{selectedTicket.user.name}</strong> ({selectedTicket.user.email})</span>
                  <span>•</span>
                  <span>Kategori: {selectedTicket.category.replace(/_/g, ' ')}</span>
                </p>
              </div>
              
              <div className="flex gap-2">
                {!isClosed && (
                  <>
                    {selectedTicket.orderId && (
                      <button 
                        onClick={handleWarrantyExchange}
                        disabled={isExchanging}
                        className="bg-pink-600 hover:bg-pink-500 text-foreground px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-pink-900/20 flex items-center gap-2"
                      >
                        {isExchanging ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCcw size={14} />}
                        Ganti Akun Baru (Auto)
                      </button>
                    )}
                    <button 
                      onClick={() => handleUpdateStatus(selectedTicket.id, "RESOLVED")}
                      disabled={isUpdatingStatus}
                      className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Tutup Tiket Selesai
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* If there's an order linked, show a small info bar */}
            {selectedTicket.order && (
              <div className="px-6 py-3 bg-violet-900/10 border-b border-violet-500/10 flex justify-between items-center">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Pesanan Terkait:</span>
                  <span className="font-bold text-primary">{selectedTicket.order.package.product.name} - {selectedTicket.order.package.name}</span>
                  <span className="text-muted-foreground font-mono">(Inv: {selectedTicket.order.invoiceNo || selectedTicket.order.id.slice(-8)})</span>
                </div>
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
              {/* Initial description bubble */}
              <div className="flex gap-4 flex-row">
                 <div className="shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                   <User size={16} />
                 </div>
                 <div className="max-w-[80%] text-left">
                   <div className="text-[10px] font-bold text-muted-foreground mb-1">{selectedTicket.user.name}</div>
                   <div className="p-4 bg-muted border border-border text-foreground rounded-2xl rounded-tl-none whitespace-pre-wrap text-sm">
                     <span className="font-bold block mb-2 text-primary">[{selectedTicket.title}]</span>
                     {selectedTicket.description}
                   </div>
                 </div>
              </div>

              {selectedTicket.messages.map((msg, idx) => {
                // Skip the first message if it matches description (auto-created)
                if (idx === 0 && msg.message === selectedTicket.description) return null;

                const isAdmin = msg.senderId !== selectedTicket.user.id;
                const isSystem = msg.message.includes("[KLAIM GARANSI DISETUJUI]");
                
                return (
                  <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                      ${isSystem ? 'bg-pink-600 text-foreground' : isAdmin ? 'bg-violet-600 text-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {isSystem ? <RefreshCcw size={14} /> : isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
                    </div>
                    
                    <div className={`max-w-[80%] ${isAdmin ? 'text-right' : 'text-left'}`}>
                      <div className={`text-[10px] font-bold mb-1 ${isAdmin ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isSystem ? 'SISTEM' : isAdmin ? 'Admin JStore' : selectedTicket.user.name} 
                        <span className="text-gray-600 font-normal ml-2">{format(new Date(msg.createdAt), "HH:mm", { locale: localeId })}</span>
                      </div>
                      <div className={`p-4 rounded-2xl whitespace-pre-wrap text-sm inline-block text-left
                        ${isSystem ? 'bg-pink-500/10 border border-pink-500/20 text-pink-300 rounded-tr-none' 
                          : isAdmin ? 'bg-violet-600 border border-violet-500 text-foreground rounded-tr-none shadow-lg shadow-violet-900/20' 
                                  : 'bg-muted border border-border text-foreground rounded-tl-none'}`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Form */}
            {!isClosed ? (
              <div className="p-4 border-t border-border bg-[#0a0a0f]/80 backdrop-blur-sm">
                <form onSubmit={handleSendReply} className="flex flex-col gap-3">
                  <textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                    placeholder="Ketik balasan Anda untuk pelanggan..." 
                    rows={3}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isReplying}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-foreground px-6 py-2 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-lg shadow-violet-900/20"
                    >
                      {isReplying ? "Mengirim..." : <><Send size={16} /> Kirim Balasan</>}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4 border-t border-border bg-muted text-center text-muted-foreground text-sm font-medium">
                Tiket ini telah ditutup. Tidak dapat membalas.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <MessageSquare size={32} className="opacity-50" />
            </div>
            <p>Pilih tiket dari daftar di sebelah kiri untuk melihat detail dan membalas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
