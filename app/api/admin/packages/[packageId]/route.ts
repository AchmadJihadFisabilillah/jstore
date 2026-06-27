import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/admin-guard";

const updateSchema = z.object({
  name: z.string().min(2),
  duration: z.number().int().min(1),
  price: z.number().int().min(500),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ packageId: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const payload = updateSchema.parse(await request.json());
    const { packageId } = await params;
    const pkg = await prisma.package.update({
      where: { id: packageId },
      data: payload,
    });
    return NextResponse.json(pkg);
  } catch {
    return NextResponse.json({ message: "Gagal update paket." }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ packageId: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { packageId } = await params;
  await prisma.package.delete({ where: { id: packageId } });
  return NextResponse.json({ message: "Paket dihapus." });
}
