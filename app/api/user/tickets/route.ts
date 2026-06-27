import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const createTicketSchema = z.object({
  category: z.string(),
  title: z.string().min(5),
  description: z.string().min(10),
  priority: z.string(),
  orderId: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createTicketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { category, title, description, priority, orderId } = result.data;

    // Generate ticket number: TCK-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
    const ticketNo = `TCK-${dateStr}-${randomStr}`;

    const ticket = await prisma.ticket.create({
      data: {
        userId: session.user.id,
        ticketNo,
        category,
        title,
        description,
        priority,
        status: "NEW",
        orderId: orderId || null,
        messages: {
          create: {
            senderId: session.user.id,
            message: description,
          }
        }
      }
    });

    // Notify admins
    await prisma.adminNotification.create({
      data: {
        title: `Tiket Baru: ${ticketNo}`,
        message: `${session.user.name} membuat tiket baru.`,
        type: "TICKET_NEW",
        link: `/admin/tickets/${ticket.id}`
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Ticket Create Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add API for adding messages to ticket
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ticketId, message } = body;

    if (!ticketId || !message) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Verify ownership
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
    }

    const ticketMsg = await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: session.user.id,
        message,
      }
    });

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { 
        status: "WAITING_ADMIN", // Change status because user replied
        updatedAt: new Date()
      }
    });

    return NextResponse.json(ticketMsg);
  } catch (error) {
    console.error("Ticket Reply Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
