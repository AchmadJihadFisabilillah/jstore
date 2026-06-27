"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Trash2, ShoppingCart, Loader2 } from "lucide-react";

interface WishlistProduct {
  id: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    packages: { price: number }[];
  };
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setWishlist(wishlist.filter(w => w.product.id !== productId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Heart className="text-pink-500 fill-pink-500" size={24} /> 
          Daftar Keinginan (Wishlist)
        </h1>
        <p className="text-muted-foreground text-sm">Simpan produk impian Anda di sini untuk dibeli nanti.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm">Memuat wishlist...</span>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <Heart className="text-muted-foreground" size={32} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Wishlist masih kosong</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Anda belum menambahkan produk apapun ke daftar keinginan. Jelajahi katalog kami dan temukan produk favorit Anda!
          </p>
          <Link href="/katalog" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-foreground px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-violet-900/20">
            Mulai Belanja <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col group relative hover:border-border transition-colors">
              <button 
                onClick={() => handleRemove(item.product.id)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                title="Hapus dari Wishlist"
              >
                <Trash2 size={14} />
              </button>
              
              <Link href={`/katalog/${item.product.slug}`} className="flex items-start gap-4 mb-4 flex-1">
                <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center p-2 shrink-0 border border-border">
                  {item.product.logoUrl ? (
                    <img src={item.product.logoUrl} alt={item.product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-500 rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">{item.product.name}</h3>
                  <div className="text-sm font-bold text-primary">
                    Mulai Rp {item.product.packages?.[0]?.price?.toLocaleString('id-ID') || 0}
                  </div>
                </div>
              </Link>
              
              <Link href={`/katalog/${item.product.slug}`} className="w-full bg-muted hover:bg-muted border border-border text-foreground px-4 py-2.5 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2">
                <ShoppingCart size={14} /> Beli Sekarang
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
