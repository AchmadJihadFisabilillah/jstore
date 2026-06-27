"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  orderId: string;
  hasReviewed: boolean;
  existingReview?: {
    rating: number;
    comment: string | null;
    reply: string | null;
  };
}

export function ReviewForm({ orderId, hasReviewed, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(hasReviewed);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, comment }),
      });
      
      if (res.ok) {
        setIsSuccess(true);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengirim ulasan");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess || hasReviewed) {
    const finalRating = existingReview?.rating || rating;
    const finalComment = existingReview?.comment || comment;
    
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="text-emerald-400" size={24} />
          <h3 className="font-bold text-emerald-400">Terima kasih atas ulasan Anda!</h3>
        </div>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={18} 
              className={star <= finalRating ? "fill-amber-400 text-amber-400" : "text-gray-600"} 
            />
          ))}
        </div>
        {finalComment && (
          <p className="text-muted-foreground text-sm italic">"{finalComment}"</p>
        )}
        
        {existingReview?.reply && (
          <div className="mt-4 p-4 bg-muted rounded-xl border border-border">
            <p className="text-xs font-bold text-primary mb-1">Balasan JStore</p>
            <p className="text-sm text-muted-foreground">{existingReview.reply}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-2">Bagaimana pesanan Anda?</h3>
      <p className="text-sm text-muted-foreground mb-6">Bantu kami menjadi lebih baik dengan memberikan rating bintang 5.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star 
                size={32} 
                className={`transition-colors ${
                  star <= (hoverRating || rating) 
                    ? "fill-amber-400 text-amber-400" 
                    : "fill-transparent text-gray-600"
                }`} 
              />
            </button>
          ))}
        </div>
        
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tulis komentar Anda (Opsional)..."
          rows={3}
          className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors resize-none"
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-foreground font-bold py-3 px-4 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? "Mengirim..." : <><Send size={18} /> Kirim Ulasan</>}
        </button>
      </form>
    </div>
  );
}
