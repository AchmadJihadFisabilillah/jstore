import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { shortDesc: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 5,
      include: {
        packages: {
          orderBy: { price: 'asc' },
          take: 1
        }
      }
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Public Search Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
