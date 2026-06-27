import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Role } from "@/lib/constants/roles";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { AdminHeader } from "@/components/shared/admin-header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSession();
  
  // Guard the entire /admin subtree. 
  // NextAuth middleware also checks, but page layout check ensures absolute safety
  if (!session || !session.user || session.user.role === Role.USER) {
    redirect("/admin/login");
  }

  // Cast properties for TypeScript safety
  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as Role,
    permissions: (session.user.permissions as string[]) || [],
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050508] text-foreground font-sans antialiased">
      <AdminSidebar user={user} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:px-8 lg:py-7 custom-scrollbar bg-gradient-to-br from-[#050508] to-[#07070c]">
          {children}
        </main>
      </div>
    </div>
  );
}
