import { CategoriesManager } from "@/components/sections/categories-manager";
import { FolderTree } from "lucide-react";

export const metadata = {
  title: "Kelola Kategori - JStore Admin",
};

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-primary">
          <FolderTree size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-none">Kelola Kategori</h1>
          <p className="text-xs text-muted-foreground mt-1">Buat, modifikasi, dan atur penempatan kategori produk digital.</p>
        </div>
      </div>

      <CategoriesManager />
    </div>
  );
}
