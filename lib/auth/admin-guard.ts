import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { Role } from "@/lib/constants/roles";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role === Role.USER) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true as const, session };
}
