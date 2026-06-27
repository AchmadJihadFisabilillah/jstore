import { SettingsManager } from "@/components/sections/settings-manager";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Pengaturan Utama Sistem - JStore Admin",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Pengaturan Utama Sistem</h1>
          <p className="text-xs text-muted-foreground mt-1">Konfigurasi profile, kontak toko, biaya penanganan transfer manual, mata uang, dan status toko.</p>
        </div>
      </div>

      <SettingsManager />
    </div>
  );
}
