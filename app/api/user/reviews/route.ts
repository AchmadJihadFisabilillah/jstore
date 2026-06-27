import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const createReviewSchema = z.object({
  orderId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { orderId, rating, comment } = result.data;

    // Verify order exists, belongs to user, is PAID or EXPIRED, and has no review yet
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true }
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PAID" && order.status !== "EXPIRED") {
      return NextResponse.json({ error: "Hanya pesanan sukses yang dapat diulas" }, { status: 400 });
    }

    if (order.review) {
      return NextResponse.json({ error: "Anda sudah memberikan ulasan untuk pesanan ini" }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        orderId: order.id,
        packageId: order.packageId,
        rating,
        comment
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review Create Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
