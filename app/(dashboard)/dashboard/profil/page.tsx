import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { ProfileClientPage } from "./client-page";

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true }
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileClientPage user={user} />;
}
