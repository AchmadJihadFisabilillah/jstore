import { PublicNavbar } from "@/components/shared/public-navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <div className="mobile-bottom-spacing">{children}</div>
    </>
  );
}
