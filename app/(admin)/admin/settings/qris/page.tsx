"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminQrisSettingPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/qris")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.qrisImageUrl) {
          setPreview(data.qrisImageUrl);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    if (file) {
      formData.append("qrisImage", file);
    }
    if (settings?.qrisImageUrl && !file) {
      formData.append("existingImageUrl", settings.qrisImageUrl);
    }

    try {
      const res = await fetch("/api/admin/settings/qris", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");

      setSettings(data.settings);
      setMessage({ type: "success", text: "Pengaturan berhasil disimpan" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengaturan QRIS Manual</h1>

      {message && (
        <div className={`p-4 rounded-xl mb-6 ${message.type === "success" ? "bg-green-900/20 text-green-500 border border-green-800" : "bg-red-900/20 text-red-500 border border-red-800"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        
        <div className="flex items-center gap-4">
          <input 
            type="checkbox" 
            id="isActive" 
            name="isActive" 
            value="true"
            defaultChecked={settings?.isActive !== false} 
            className="w-5 h-5 accent-magenta-500" 
          />
          <label htmlFor="isActive" className="font-semibold text-lg">Aktifkan Pembayaran Manual QRIS</label>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nama Merchant</label>
              <input 
                type="text" 
                name="merchantName" 
                defaultValue={settings?.merchantName || "JSTORE"}
                required 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-magenta-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Batas Waktu Pembayaran (Menit)</label>
              <input 
                type="number" 
                name="expiryMinutes" 
                defaultValue={settings?.expiryMinutes || 1440}
                required 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-magenta-500"
              />
              <span className="text-xs text-gray-500 mt-1">1440 menit = 24 jam</span>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Nomor WhatsApp Bantuan</label>
              <input 
                type="text" 
                name="whatsappNumber" 
                defaultValue={settings?.whatsappNumber || ""}
                placeholder="Contoh: 6281234567890"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-magenta-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Instruksi Pembayaran</label>
              <textarea 
                name="instructions" 
                defaultValue={settings?.instructions || "Silakan scan kode QRIS menggunakan aplikasi M-Banking atau E-Wallet Anda. Pastikan nominal sesuai dengan total invoice."}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-magenta-500 resize-none"
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm text-gray-400 mb-1">Gambar QRIS Toko</label>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-800 min-h-[300px] relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {preview ? (
                <div className="relative w-full h-64">
                  <Image src={preview} alt="QRIS Preview" fill className="object-contain" />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <p>Klik atau drop file QRIS di sini</p>
                </div>
              )}
            </div>
            {preview && <p className="text-xs text-center text-gray-500">Klik gambar untuk mengganti</p>}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-magenta-600 hover:bg-magenta-700 text-white px-8 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
