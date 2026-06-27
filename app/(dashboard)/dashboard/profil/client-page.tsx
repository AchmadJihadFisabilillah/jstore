"use client";

import { useState } from "react";
import { User, Mail, Save, AlertCircle, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileClientPage({ user }: { user: { name: string; email: string; createdAt: Date; id: string } }) {
  const router = useRouter();
  
  // Profile state
  const [name, setName] = useState(user.name);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile", name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfileStatus({ type: 'success', message: "Profil berhasil diperbarui." });
      router.refresh();
    } catch (err: any) {
      setProfileStatus({ type: 'error', message: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: "Password baru dan konfirmasi tidak cocok." });
      return;
    }
    
    setPasswordLoading(true);
    setPasswordStatus(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setPasswordStatus({ type: 'success', message: "Password berhasil diperbarui." });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Profil & Keamanan</h1>
        <p className="text-muted-foreground text-sm">Kelola data pribadi dan pengaturan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Sidebar - User Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-[40px] rounded-full pointer-events-none"></div>
            
            <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-foreground mb-4 shadow-lg shadow-violet-900/20 border-4 border-[#0d0d12] relative z-10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-lg font-bold text-foreground relative z-10">{user.name}</h2>
            <p className="text-sm text-muted-foreground mb-4 relative z-10">{user.email}</p>
            
            <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-xs font-bold border border-green-500/20 relative z-10">
              <ShieldCheck size={14} /> Akun Terverifikasi
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">Informasi Akun</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Bergabung</span>
                <span className="text-foreground font-medium">{new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-400 font-medium">Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2 bg-violet-500/10 text-primary rounded-lg">
                <User size={20} />
              </div>
              <h2 className="text-lg font-bold text-foreground">Data Diri</h2>
            </div>

            {profileStatus && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
                profileStatus.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {profileStatus.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <p className="text-sm">{profileStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Alamat Email</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full bg-muted border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Email tidak dapat diubah untuk alasan keamanan.</p>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={profileLoading || name === user.name}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-foreground px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? "Menyimpan..." : <><Save size={16} /> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Ubah Password</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Pastikan Anda menggunakan kombinasi huruf dan angka.</p>
              </div>
            </div>

            {passwordStatus && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
                passwordStatus.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {passwordStatus.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <p className="text-sm">{passwordStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Password Lama</label>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Password Baru</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={passwordLoading || !oldPassword || !newPassword || !confirmPassword}
                  className="flex items-center gap-2 bg-muted hover:bg-white/15 border border-border text-foreground px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? "Memproses..." : <><Lock size={16} /> Ubah Password</>}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
