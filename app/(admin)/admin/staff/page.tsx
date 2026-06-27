import { StaffManager } from "@/components/sections/staff-manager";
import { UserCheck } from "lucide-react";

export const metadata = {
  title: "Pengaturan Staf & Hak Akses - JStore Admin",
};

export default function AdminStaffPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <UserCheck size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Pengaturan Staf & Akses</h1>
          <p className="text-xs text-muted-foreground mt-1">Registrasikan staf toko baru, atur batasan peran, dan berikan izin kustom tambahan.</p>
        </div>
      </div>

      <StaffManager />
    </div>
  );
}
