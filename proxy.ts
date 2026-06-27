import { withAuth } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

const ADMIN_ROLES = [
  "ADMIN",
  "SUPER_ADMIN",
  "ADMIN_PRODUK",
  "ADMIN_PESANAN",
  "ADMIN_KEUANGAN",
  "CUSTOMER_SERVICE",
];

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname === "/admin/login") return true;
      if (!token) return false;
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return ADMIN_ROLES.includes(token.role as string);
      }
      return true;
    },
  },
});
