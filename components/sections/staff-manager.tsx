"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Shield, Key, Loader2, CheckSquare, Square , Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

const AVAILABLE_ROLES = [
  { label: "Administrator", value: "ADMIN" },
];

export function StaffManager() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAddDrawer = () => {
    setEditingStaff(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("ADMIN");
    setSelectedPermissions([]);
    setIsActive(true);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (s: Staff) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setPassword("");
    setRole(s.role);
    setSelectedPermissions(s.permissions || []);
    setIsActive(s.isActive);
    setFormError("");
    setDrawerOpen(true);
  };

  const handleTogglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitLoading(true);

    const payload = {
      name,
      email,
      password: password || undefined,
      role,
      permissions: selectedPermissions,
      isActive,
    };

    try {
      const url = editingStaff ? `/api/admin/staff/${editingStaff.id}` : "/api/admin/staff";
      const method = editingStaff ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses staff");
      }

      setActionMessage({
        type: "success",
        text: editingStaff ? "Data staff berhasil diperbarui!" : "Akun staff baru berhasil dibuat!",
      });
      setDrawerOpen(false);
      fetchStaff();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (s: Staff) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun staff "${s.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/staff/${s.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus staff");
      }

      setActionMessage({ type: "success", text: "Akun staff berhasil dihapus." });
      fetchStaff();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatRoleLabel = (roleVal: string) => {
    const matched = AVAILABLE_ROLES.find((r) => r.value === roleVal);
    return matched ? matched.label : roleVal;
  };

  useEffect(() => {
    if (actionMessage) {
      const t = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionMessage]);

  return (
    <div className="space-y-4">
      {actionMessage && (
        <div className="p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {actionMessage.text}
        </div>
      )}

      {/* Control Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Daftar Akun Staf</h2>
          <p className="text-xs text-muted-foreground">Atur akun staf operasional, batasi hak akses modul, dan kelola otorisasi RBAC.</p>
        </div>
        <Button onClick={openAddDrawer} className="inline-flex items-center gap-1.5 self-start sm:self-center">
          <Plus size={16} /> Tambah Staf
        </Button>
      </div>

      {/* Staff Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="animate-spin text-primary" size={20} /> Memuat daftar staf...
          </div>
        ) : staffList.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={32} className="text-zinc-600 mb-2" />
            <span className="text-xs">Tidak ada akun staf terdaftar.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs admin-table">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="p-4">Nama Staf</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Peran (Role)</th>
                  <th className="p-4 text-center">Izin Kustom</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s.id} className="group align-top">
                    <td className="p-4 font-bold text-foreground text-sm">{s.name}</td>
                    <td className="p-4 font-mono text-muted-foreground">{s.email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-600/10 text-primary font-bold text-[10px]">
                        <Shield size={10} /> {formatRoleLabel(s.role)}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-muted-foreground">
                      {s.permissions?.length || 0} Izin
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          s.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditDrawer(s)}
                          className="p-1.5 rounded-lg border border-border bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Form Drawer */}
      {drawerOpen && (
        <div className="admin-drawer-overlay">
          <div className="admin-drawer-panel max-w-lg p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <h3 className="text-base font-bold text-foreground">
                  {editingStaff ? "Edit Akun Staf" : "Tambah Akun Staf"}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nama Lengkap</label>
                    <Input required placeholder="Alexander" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email Staf</label>
                    <Input required placeholder="alex@jstore.id" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Peran (Default Role)</label>
                    <select
                      className="w-full rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-foreground outline-none ring-[var(--primary)] focus:ring-2"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      {AVAILABLE_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Password Keamanan</label>
                    <Input
                      required={!editingStaff}
                      placeholder={editingStaff ? "Isi jika ingin ubah sandi" : "••••••••"}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Override Permissions List */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-primary block border-b border-border pb-1">Izin Kustom Tambahan (Permissions Checklist)</label>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Centang izin di bawah untuk memberikan akses modular spesifik di luar batasan peran bawaannya.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2.5 border border-border bg-card rounded-xl custom-scrollbar font-semibold">
                    {Object.entries(PERMISSIONS).map(([key, val]) => {
                      const isChecked = selectedPermissions.includes(val);
                      return (
                        <button
                          type="button"
                          key={val}
                          onClick={() => handleTogglePermission(val)}
                          className="flex items-center gap-2 text-left p-1.5 rounded hover:bg-muted transition text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          {isChecked ? (
                            <CheckSquare size={13} className="text-primary" />
                          ) : (
                            <Square size={13} className="text-zinc-600" />
                          )}
                          <span className="truncate">{key.replace("_", " ")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isStaffActive"
                    className="h-4 w-4 rounded border-border bg-muted text-violet-600 accent-violet-600 focus:ring-violet-500 cursor-pointer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="isStaffActive" className="text-xs font-semibold text-foreground select-none cursor-pointer">
                    Staf aktif (non-centang untuk memblokir akses dashboard)
                  </label>
                </div>

                {formError && <p className="text-xs text-red-500 font-semibold">{formError}</p>}
              </form>
            </div>

            <div className="pt-6 border-t border-border flex gap-2">
              <Button onClick={() => setDrawerOpen(false)} className="flex-1 bg-muted hover:bg-muted text-foreground">
                Batal
              </Button>
              <Button onClick={handleSubmit} className="flex-1" isLoading={submitLoading}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
