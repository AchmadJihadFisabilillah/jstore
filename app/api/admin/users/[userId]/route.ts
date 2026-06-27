import { Role } from "@/lib/constants/roles";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/admin-guard";

const schema = z.object({
  role: z.nativeEnum(Role),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { role } = schema.parse(await request.json());
    const { userId } = await params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: "Gagal update role user." }, { status: 400 });
  }
}
