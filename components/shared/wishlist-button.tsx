"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function WishlistButton({ productId }: { productId: string }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if it's already in wishlist
    const checkWishlist = async () => {
      try {
        const res = await fetch("/api/user/wishlist");
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            setIsWishlisted(list.some(item => item.product.id === productId));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkWishlist();
  }, [productId]);

  const toggleWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.added);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
      </button>
    );
  }

  return (
    <button 
      onClick={toggleWishlist}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-2.5 rounded-xl border transition-all ${
        isWishlisted 
          ? "bg-pink-500/10 border-pink-500/20 text-pink-500" 
          : "bg-card border-border text-muted-foreground hover:text-pink-400 hover:border-pink-500/30"
      }`}
      title={isWishlisted ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
    >
      <Heart 
        size={20} 
        className={`${isWishlisted ? 'fill-pink-500' : ''} ${isHovered && !isWishlisted ? 'fill-pink-400/20' : ''}`} 
      />
    </button>
  );
}
