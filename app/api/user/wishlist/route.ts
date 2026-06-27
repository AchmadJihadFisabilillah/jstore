import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

// Get user wishlist
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            packages: {
              orderBy: { price: 'asc' },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Wishlist GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add or remove from wishlist
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    });

    if (existing) {
      // Remove from wishlist (toggle off)
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ success: true, added: false });
    } else {
      // Add to wishlist
      await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          productId
        }
      });
      return NextResponse.json({ success: true, added: true });
    }

  } catch (error) {
    console.error("Wishlist POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
