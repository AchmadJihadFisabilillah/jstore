import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { orderRepository } from "@/lib/repositories/order-repository";
import { logAdminActivity } from "@/lib/utils/audit";
import { encrypt } from "@/lib/utils/encryption";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.ORDERS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { action, status, adminNotes, rejectionReason, digitalStockId, manualData } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        package: { include: { product: true } },
        digitalStocks: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Get the currently active stock for this order
    const activeStock = order.digitalStocks.find(s => s.status === "SOLD" || s.status === "RESERVED") || order.digitalStocks[0];

    // ACTION: Assign existing stock item manually
    if (action === "assign_stock" && digitalStockId) {
      const stock = await prisma.digitalStock.findUnique({
        where: { id: digitalStockId },
      });

      if (!stock || (stock.status !== "AVAILABLE" && stock.orderId !== id)) {
        return NextResponse.json(
          { message: "Stock item tidak tersedia atau sudah digunakan" },
          { status: 400 }
        );
      }

      // Reset any previous stock linked to this order back to AVAILABLE
      if (activeStock) {
        await prisma.digitalStock.update({
          where: { id: activeStock.id },
          data: { status: "AVAILABLE", orderId: null },
        });
      }

      // Bind new stock
      await prisma.digitalStock.update({
        where: { id: digitalStockId },
        data: { status: "SOLD", orderId: id },
      });

      await logAdminActivity({
        userId: auth.session.user.id,
        action: "ASSIGN_STOCK_MANUAL",
        module: "ORDER",
        details: `Mengaitkan stok ID: ${digitalStockId} ke Order #${order.invoiceNo || order.id}`,
        req,
      });

      return NextResponse.json({ success: true });
    }

    // ACTION: Deliver manual stock text
    if (action === "deliver_manual" && manualData) {
      // Reset previous stock if any
      if (activeStock) {
        await prisma.digitalStock.update({
          where: { id: activeStock.id },
          data: { status: "AVAILABLE", orderId: null },
        });
      }

      // Create a SOLD manual stock record
      await prisma.digitalStock.create({
        data: {
          packageId: order.packageId,
          type: "MANUAL",
          notes: manualData,
          status: "SOLD",
          orderId: id,
          adminId: auth.session.user.id,
        },
      });

      await logAdminActivity({
        userId: auth.session.user.id,
        action: "DELIVER_MANUAL_STOCK",
        module: "ORDER",
        details: `Mengirim stok manual untuk Order #${order.invoiceNo || order.id}`,
        req,
      });

      return NextResponse.json({ success: true });
    }

    // STANDARD ACTION: Update Order Details or Status
    const updateData: any = {};
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

    // Handle status change explicitly
    if (status && status !== order.status) {
      if (status === "PAID") {
        // Enforce the full repository markPaid + setEndDate flow
        await orderRepository.markPaid(id);
        await orderRepository.setEndDate(id, order.package.duration);
        
        // Also check if invoice number is missing, generate one
        if (!order.invoiceNo) {
          const timestamp = Date.now().toString().slice(-6);
          updateData.invoiceNo = `INV-${order.package.sku || "JSTORE"}-${timestamp}`;
        }
      } else if (status === "EXPIRED") {
        await orderRepository.markExpired(id);
        
        // If it had an assigned stock, release it back to AVAILABLE
        if (activeStock) {
          await prisma.digitalStock.update({
            where: { id: activeStock.id },
            data: { status: "AVAILABLE", orderId: null },
          });
        }
      } else {
        updateData.status = status;
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        processedById: auth.session.user.id,
      },
      include: {
        user: true,
        package: { include: { product: true } },
        digitalStocks: true,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "UPDATE_ORDER",
      module: "ORDER",
      details: `Mengubah status/detail Order #${updatedOrder.invoiceNo || updatedOrder.id} menjadi ${updatedOrder.status}`,
      req,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update admin order:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requirePermission(PERMISSIONS.ORDERS_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { status } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { package: true, digitalStocks: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const activeStock = order.digitalStocks.find(s => s.status === "SOLD" || s.status === "RESERVED") || order.digitalStocks[0];

    if (status) {
      if (status === "PAID") {
        await orderRepository.markPaid(id);
        await orderRepository.setEndDate(id, order.package.duration);
      } else if (status === "EXPIRED") {
        await orderRepository.markExpired(id);
        if (activeStock) {
          await prisma.digitalStock.update({
            where: { id: activeStock.id },
            data: { status: "AVAILABLE", orderId: null },
          });
        }
      } else {
        await prisma.order.update({
          where: { id },
          data: { status },
        });
      }
    }

    const updated = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        package: { include: { product: true } },
        digitalStocks: true,
      },
    });

    await logAdminActivity({
      userId: auth.session.user.id,
      action: "PATCH_ORDER_STATUS",
      module: "ORDER",
      details: `Mengubah status Order #${updated?.invoiceNo || id} menjadi ${status} via legacy patch`,
      req,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to patch order:", error);
    return NextResponse.json({ message: "Gagal update status order." }, { status: 400 });
  }
}
