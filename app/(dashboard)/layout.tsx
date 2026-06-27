import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { DashboardLayoutClient } from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Admin should probably go to /admin instead of user dashboard
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <DashboardLayoutClient user={{ name: session.user.name || "User", email: session.user.email || "" }}>
      {children}
    </DashboardLayoutClient>
  );
}
