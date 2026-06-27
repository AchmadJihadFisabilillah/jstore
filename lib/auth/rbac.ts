import { Role } from "@/lib/constants/roles";
import { getSession } from "./session";
import { NextResponse } from "next/server";
import { hasPermission } from "./permissions";

export { PERMISSIONS, ROLE_PERMISSIONS, hasPermission } from "./permissions";

export async function requirePermission(permission: string) {
  const session = await getSession();
  if (!session || !session.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  
  const userRole = session.user.role as Role;
  
  // If the user is USER, block them
  if (userRole === Role.USER) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }
  
  const hasPerm = hasPermission({ role: userRole, permissions: session.user.permissions }, permission);
  if (!hasPerm) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }
  
  return { ok: true as const, session };
}
