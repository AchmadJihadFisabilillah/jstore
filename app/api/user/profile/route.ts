import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { compareSync, hashSync } from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama harus diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action; // 'profile' or 'password'

    if (action === 'profile') {
      const parsed = updateProfileSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { name: parsed.data.name }
      });

      return NextResponse.json({ message: "Profil berhasil diperbarui", user: { name: updatedUser.name } });
    } 
    else if (action === 'password') {
      const parsed = updatePasswordSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });

      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

      const isValid = compareSync(parsed.data.oldPassword, user.password);
      if (!isValid) return NextResponse.json({ error: "Password lama salah" }, { status: 400 });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashSync(parsed.data.newPassword, 10) }
      });

      return NextResponse.json({ message: "Password berhasil diperbarui" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
