"use client";

import { useState } from "react";
import { Star, User, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  createdAt: string;
  user: {
    name: string;
  };
  package: {
    name: string;
  };
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(1);
  const perPage = 5;
  const totalPages = Math.ceil(reviews.length / perPage);
  
  if (reviews.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center mt-6">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="text-muted-foreground" size={24} />
        </div>
        <p className="text-muted-foreground text-sm">Belum ada ulasan untuk produk ini. Jadilah yang pertama!</p>
      </div>
    );
  }

  const paginatedReviews = reviews.slice((page - 1) * perPage, page * perPage);

  // Calculate average rating
  const avgRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl font-black text-foreground">{avgRating}</div>
        <div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={16} className={star <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "fill-gray-600 text-gray-600"} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Berdasarkan {reviews.length} ulasan terverifikasi</p>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedReviews.map(review => (
          <div key={review.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{review.user.name}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(review.createdAt), "dd MMM yyyy", { locale: localeId })} • Varian: {review.package.name}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={14} className={star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-600 text-gray-600"} />
                ))}
              </div>
            </div>
            
            {review.comment && (
              <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
            )}

            {review.reply && (
              <div className="mt-4 p-3 bg-muted rounded-xl border border-border ml-4 relative">
                <div className="absolute -top-2 left-4 w-4 h-4 rotate-45 bg-muted border-t border-l border-border"></div>
                <p className="text-[10px] font-bold text-primary mb-1">Balasan JStore</p>
                <p className="text-xs text-muted-foreground">{review.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-muted disabled:opacity-50 hover:bg-muted text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-muted-foreground">Halaman {page} dari {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-muted disabled:opacity-50 hover:bg-muted text-foreground transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
