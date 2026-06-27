import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/admin-guard";

const createSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(2),
  duration: z.number().int().min(1),
  price: z.number().int().min(500),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const payload = createSchema.parse(await request.json());
    const pkg = await prisma.package.create({ data: payload });
    return NextResponse.json(pkg, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Data paket tidak valid." }, { status: 400 });
  }
}
