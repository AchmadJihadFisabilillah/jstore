import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { logAdminActivity } from "@/lib/utils/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.TICKETS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
        order: {
          include: {
            package: {
              include: { product: true },
            },
            digitalStocks: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Failed to fetch support ticket details:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.TICKETS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { action, status, message, priority, assignToMe } = body;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // ACTION: Warranty Exchange / Account Replacement
    if (action === "warranty_exchange") {
      if (!ticket.orderId) {
        return NextResponse.json(
          { message: "Tiket ini tidak terkait dengan pesanan apapun" },
          { status: 400 }
        );
      }

      const order = await prisma.order.findUnique({
        where: { id: ticket.orderId },
        include: { digitalStocks: true, package: { include: { product: true } } },
      });

      if (!order) {
        return NextResponse.json({ message: "Pesanan tidak ditemukan" }, { status: 400 });
      }

      // Mark current stock as FAULTY if it exists
      const activeStock = order.digitalStocks.find(s => s.status === "SOLD" || s.status === "RESERVED");
      if (activeStock) {
        await prisma.digitalStock.update({
          where: { id: activeStock.id },
          data: { status: "FAULTY" },
        });
      }

      // Find another available digital stock of the exact same package
      const newStock = await prisma.digitalStock.findFirst({
        where: { packageId: order.packageId, status: "AVAILABLE" },
        orderBy: { createdAt: "asc" },
      });

      if (!newStock) {
        return NextResponse.json(
          {
            message:
              "Stok pengganti tidak tersedia! Silakan isi stok baru untuk paket ini terlebih dahulu.",
          },
          { status: 400 }
        );
      }

      // Bind the new stock to this order
      await prisma.digitalStock.update({
        where: { id: newStock.id },
        data: { status: "SOLD", orderId: order.id },
      });

      // Post a system message in the ticket conversation
      await prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: auth.session.user.id,
          message: `[KLAIM GARANSI DISETUJUI] Sistem telah melakukan pergantian akun secara otomatis. Akun baru berhasil dikirimkan ke dashboard pelanggan.`,
        },
      });

      await logAdminActivity({
        userId: auth.session.user.id,
        action: "WARRANTY_REPLACEMENT",
        module: "TICKET",
        details: `Mengganti stok akun bermasalah untuk Order #${order.invoiceNo || order.id} (Tiket #${ticket.ticketNo})`,
        req,
      });

      return NextResponse.json({ success: true });
    }

    // ACTION: Add Message Reply
    if (message) {
      const chatMessage = await prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: auth.session.user.id,
          message,
        },
      });

      // Update status to WAITING_USER unless override is supplied
      await prisma.ticket.update({
        where: { id },
        data: {
          status: status || "WAITING_USER",
          adminId: ticket.adminId || auth.session.user.id,
        },
      });

      await logAdminActivity({
        userId: auth.session.user.id,
        action: "REPLY_TICKET",
        module: "TICKET",
        details: `Membalas tiket support #${ticket.ticketNo}`,
        req,
      });

      return NextResponse.json(chatMessage);
    }

    // STANDARD ACTION: Update Status, Priority, or Assignee
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignToMe) {
      updateData.adminId = auth.session.user.id;
      // Also update status to IN_PROGRESS if it was NEW
      if (ticket.status === "NEW") {
        updateData.status = "IN_PROGRESS";
      }
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: updateData,
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_TICKET_ATTRS",
      module: "TICKET",
      details: `Mengubah atribut tiket support #${ticket.ticketNo}`,
      req,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to process ticket update:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
