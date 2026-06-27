import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

interface TakeStockResult {
  success: boolean;
  message?: string;
  stock?: any;
}

export const stockService = {
  /**
   * Mengunci stok (RESERVED) saat order baru saja dibuat (PENDING).
   * Menghindari 2 user membeli stok terakhir secara bersamaan.
   */
  async reserveStockForOrder(orderId: string, packageId: string): Promise<TakeStockResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Find 1 available stock using SKIP LOCKED
        const availableStocks: any[] = await tx.$queryRaw`
          SELECT id FROM "DigitalStock"
          WHERE "packageId" = ${packageId} AND status = 'AVAILABLE'
          ORDER BY "expiryDate" ASC NULLS LAST, "createdAt" ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        `;

        if (availableStocks.length === 0) {
          throw new Error("Stok produk tidak tersedia saat ini");
        }

        const stockId = availableStocks[0].id;
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 mins lock

        const reservedStock = await tx.digitalStock.update({
          where: { id: stockId },
          data: {
            status: "RESERVED",
            orderId: orderId,
            reservedAt: new Date(),
            reservationExpiresAt: expiresAt,
          },
        });

        await tx.stockMovement.create({
          data: {
            stockId,
            action: "RESERVE",
            fromStatus: "AVAILABLE",
            toStatus: "RESERVED",
            orderId: orderId,
            adminId: "SYSTEM",
            reason: "Auto-reserve saat order dibuat",
          },
        });

        return { success: true, stock: reservedStock };
      });
    } catch (error: any) {
      console.error("Reserve Stock for Order Error:", error);
      return { success: false, message: error.message || "Gagal mereservasi stok" };
    }
  },

  /**
   * Automate fulfillment: Update reserved stock to SOLD
   */
  async fulfillOrder(orderId: string, adminId: string): Promise<TakeStockResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { package: true, digitalStocks: true },
        });

        if (!order) {
          throw new Error("Order tidak ditemukan");
        }

        if (order.status !== "PAID") {
          return { success: false, message: "Status order belum dibayar (Lunas)" };
        }

        // Cari stok yang sebelumnya sudah di-RESERVED untuk order ini
        const reservedStock = order.digitalStocks.find((s) => s.status === "RESERVED");

        if (reservedStock) {
          // Jadikan SOLD
          const updatedStock = await tx.digitalStock.update({
            where: { id: reservedStock.id },
            data: {
              status: "SOLD",
              assignedToUserId: order.userId,
              assignedAt: new Date(),
            },
          });

          await tx.stockMovement.create({
            data: {
              stockId: reservedStock.id,
              action: "ASSIGN",
              fromStatus: "RESERVED",
              toStatus: "SOLD",
              orderId: order.id,
              customerId: order.userId,
              adminId,
              reason: "Fulfillment via system",
            },
          });

          return { success: true, stock: updatedStock };
        }

        // Fallback: Jika tidak ada RESERVED, coba cari AVAILABLE (misal reservasi kedaluwarsa tapi dibayar manual)
        const availableStocks: any[] = await tx.$queryRaw`
          SELECT id FROM "DigitalStock"
          WHERE "packageId" = ${order.packageId} AND status = 'AVAILABLE'
          ORDER BY "expiryDate" ASC NULLS LAST, "createdAt" ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        `;

        if (availableStocks.length === 0) {
          return { success: false, message: "Stok produk habis dan tidak ada reservasi aktif" };
        }

        const stockId = availableStocks[0].id;
        const updatedStock = await tx.digitalStock.update({
          where: { id: stockId },
          data: {
            status: "SOLD",
            orderId: order.id,
            assignedToUserId: order.userId,
            assignedAt: new Date(),
          },
        });

        await tx.stockMovement.create({
          data: {
            stockId,
            action: "ASSIGN",
            fromStatus: "AVAILABLE",
            toStatus: "SOLD",
            orderId: order.id,
            customerId: order.userId,
            adminId,
            reason: "Fulfillment via system (Fallback)",
          },
        });

        return { success: true, stock: updatedStock };
      });
    } catch (error: any) {
      console.error("Fulfill Order Error:", error);
      return { success: false, message: error.message || "Gagal mengambil stok" };
    }
  },

  /**
   * Manual Reservation: Lock a stock item for an admin for 15 minutes
   */
  async reserveStock(stockId: string, adminId: string, reason: string): Promise<TakeStockResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Lock this specific row
        const stocks: any[] = await tx.$queryRaw`
          SELECT id, status FROM "DigitalStock"
          WHERE id = ${stockId}
          FOR UPDATE
        `;

        if (stocks.length === 0) {
          throw new Error("Stok tidak ditemukan");
        }

        if (stocks[0].status !== "AVAILABLE") {
          throw new Error("Stok ini tidak lagi tersedia (sudah diambil/direservasi orang lain)");
        }

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        const updated = await tx.digitalStock.update({
          where: { id: stockId },
          data: {
            status: "RESERVED",
            reservedByAdminId: adminId,
            reservedAt: new Date(),
            reservationExpiresAt: expiresAt,
          },
        });

        await tx.stockMovement.create({
          data: {
            stockId,
            action: "RESERVE",
            fromStatus: "AVAILABLE",
            toStatus: "RESERVED",
            adminId,
            reason,
          },
        });

        return { success: true, stock: updated };
      });
    } catch (error: any) {
      console.error("Reserve Stock Error:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Release a reservation back to AVAILABLE
   */
  async releaseReservation(stockId: string, adminId: string, reason: string): Promise<TakeStockResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        const stock = await tx.digitalStock.findUnique({ where: { id: stockId } });
        if (!stock) throw new Error("Stok tidak ditemukan");

        if (stock.status !== "RESERVED") {
          throw new Error("Stok ini sedang tidak dalam status RESERVED");
        }

        const updated = await tx.digitalStock.update({
          where: { id: stockId },
          data: {
            status: "AVAILABLE",
            reservedByAdminId: null,
            reservedAt: null,
            reservationExpiresAt: null,
          },
        });

        await tx.stockMovement.create({
          data: {
            stockId,
            action: "RELEASE",
            fromStatus: "RESERVED",
            toStatus: "AVAILABLE",
            adminId,
            reason,
          },
        });

        return { success: true, stock: updated };
      });
    } catch (error: any) {
      console.error("Release Reservation Error:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Replace a faulty stock with a new one
   */
  async replaceStock(oldStockId: string, orderId: string, adminId: string, reason: string): Promise<TakeStockResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        const oldStock = await tx.digitalStock.findUnique({
          where: { id: oldStockId },
        });

        if (!oldStock) throw new Error("Stok lama tidak ditemukan");
        
        // 1. Mark old stock as REPLACED (or FAULTY)
        await tx.digitalStock.update({
          where: { id: oldStockId },
          data: { status: "REPLACED", orderId: null },
        });

        await tx.stockMovement.create({
          data: {
            stockId: oldStockId,
            action: "MARK_FAULTY",
            fromStatus: oldStock.status,
            toStatus: "REPLACED",
            orderId,
            adminId,
            reason: `Diganti karena: ${reason}`,
          },
        });

        // 2. Use fulfill flow to assign a new stock
        const availableStocks: any[] = await tx.$queryRaw`
          SELECT id FROM "DigitalStock"
          WHERE "packageId" = ${oldStock.packageId} AND status = 'AVAILABLE'
          ORDER BY "expiryDate" ASC NULLS LAST, "createdAt" ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        `;

        if (availableStocks.length === 0) {
          throw new Error("Berhasil mencabut stok lama, tetapi stok pengganti tidak tersedia.");
        }

        const newStockId = availableStocks[0].id;

        const newStock = await tx.digitalStock.update({
          where: { id: newStockId },
          data: {
            status: "SOLD",
            orderId: orderId,
            assignedToUserId: oldStock.assignedToUserId, // Keep same user if it was assigned
            assignedAt: new Date(),
          },
        });

        await tx.stockMovement.create({
          data: {
            stockId: newStockId,
            action: "REPLACE",
            fromStatus: "AVAILABLE",
            toStatus: "SOLD",
            orderId,
            customerId: oldStock.assignedToUserId,
            adminId,
            reason: `Pengganti untuk stok ID: ${oldStockId}`,
          },
        });

        return { success: true, stock: newStock };
      });
    } catch (error: any) {
      console.error("Replace Stock Error:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Manual Take (for testing, custom delivery outside system, etc.)
   */
  async manualTake(stockId: string, adminId: string, reason: string): Promise<TakeStockResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        const stocks: any[] = await tx.$queryRaw`
          SELECT id, status FROM "DigitalStock"
          WHERE id = ${stockId}
          FOR UPDATE
        `;

        if (stocks.length === 0) throw new Error("Stok tidak ditemukan");
        if (stocks[0].status !== "AVAILABLE" && stocks[0].status !== "RESERVED") {
          throw new Error("Hanya stok AVAILABLE atau RESERVED yang bisa diambil manual");
        }

        const oldStatus = stocks[0].status;

        const updated = await tx.digitalStock.update({
          where: { id: stockId },
          data: {
            status: "SOLD", // Taking it out of inventory
            reservedByAdminId: null,
            reservedAt: null,
            reservationExpiresAt: null,
            adminId: adminId, // Record who took it
          },
        });

        await tx.stockMovement.create({
          data: {
            stockId,
            action: "MANUAL_TAKE",
            fromStatus: oldStatus,
            toStatus: "SOLD",
            adminId,
            reason,
          },
        });

        return { success: true, stock: updated };
      });
    } catch (error: any) {
      console.error("Manual Take Error:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Release stok yang direservasi oleh order yang sudah kadaluwarsa (> 30 menit).
   * Bisa dipanggil oleh cron job.
   */
  async releaseExpiredReservations(): Promise<{ releasedCount: number }> {
    try {
      const expiredStocks = await prisma.digitalStock.findMany({
        where: {
          status: "RESERVED",
          orderId: { not: null },
          reservationExpiresAt: { lt: new Date() },
        },
      });

      if (expiredStocks.length === 0) {
        return { releasedCount: 0 };
      }

      let count = 0;
      for (const stock of expiredStocks) {
        await prisma.$transaction(async (tx) => {
          // Verify it's still reserved
          const current = await tx.digitalStock.findUnique({ where: { id: stock.id } });
          if (current?.status !== "RESERVED") return;

          await tx.digitalStock.update({
            where: { id: stock.id },
            data: {
              status: "AVAILABLE",
              orderId: null,
              reservedAt: null,
              reservationExpiresAt: null,
            },
          });

          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              action: "RELEASE",
              fromStatus: "RESERVED",
              toStatus: "AVAILABLE",
              orderId: stock.orderId,
              adminId: "SYSTEM",
              reason: "Auto-release expired order reservation",
            },
          });

          // Also expire the order if it's still PENDING
          if (stock.orderId) {
            const order = await tx.order.findUnique({ where: { id: stock.orderId } });
            if (order && order.status === "PENDING") {
              await tx.order.update({
                where: { id: order.id },
                data: { status: "EXPIRED" },
              });
              
              // And mark payment as EXPIRED
              await tx.payment.updateMany({
                where: { orderId: order.id, status: "PENDING" },
                data: { status: "EXPIRED", expiredAt: new Date() }
              });
            }
          }
        });
        count++;
      }

      return { releasedCount: count };
    } catch (error) {
      console.error("Release Expired Reservations Error:", error);
      return { releasedCount: 0 };
    }
  }
};

