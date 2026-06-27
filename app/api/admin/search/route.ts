import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: Request) {
  try {
    const auth = await requirePermission(PERMISSIONS.DASHBOARD_VIEW);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    // Search across multiple models concurrently
    const [orders, users, products, tickets] = await Promise.all([
      // Orders: search by invoiceNo
      prisma.order.findMany({
        where: { invoiceNo: { contains: q, mode: 'insensitive' } },
        take: 5,
        select: { id: true, invoiceNo: true, status: true, user: { select: { name: true } } },
      }),
      // Users: search by name or email
      prisma.user.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
        take: 5,
        select: { id: true, name: true, email: true, role: true },
      }),
      // Products: search by name
      prisma.product.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 5,
        select: { id: true, name: true, category: true, isActive: true },
      }),
      // Tickets: search by ticketNo or title
      prisma.ticket.findMany({
        where: { OR: [{ ticketNo: { contains: q, mode: 'insensitive' } }, { title: { contains: q, mode: 'insensitive' } }] },
        take: 5,
        select: { id: true, ticketNo: true, title: true, status: true },
      }),
    ]);

    const results: Array<{ type: string; title: string | null; subtitle: string; url: string }> = [];

    orders.forEach(o => {
      results.push({ type: 'Pesanan', title: o.invoiceNo, subtitle: `Oleh: ${o.user.name} • Status: ${o.status}`, url: `/admin/pesanan?search=${o.invoiceNo}` });
    });

    users.forEach(u => {
      results.push({ type: 'Pelanggan', title: u.name, subtitle: `${u.email} • Role: ${u.role}`, url: `/admin/pelanggan?search=${u.email}` });
    });

    products.forEach(p => {
      results.push({ type: 'Produk', title: p.name, subtitle: `Kategori: ${p.category} • Status: ${p.isActive ? 'Aktif' : 'Nonaktif'}`, url: `/admin/produk` });
    });

    tickets.forEach(t => {
      results.push({ type: 'Tiket', title: `#${t.ticketNo}`, subtitle: `${t.title} • Status: ${t.status}`, url: `/admin/layanan` });
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Admin Search Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
