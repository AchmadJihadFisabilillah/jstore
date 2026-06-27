import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-[var(--line)]">
        <div className="container-jstore flex h-14 items-center">
          <Link href="/" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Kembali ke beranda
          </Link>
        </div>
      </header>
      {children}
    </>
  );
}
