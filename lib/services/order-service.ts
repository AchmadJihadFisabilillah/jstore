import { z } from "zod";
import { orderRepository } from "@/lib/repositories/order-repository";
import { prisma } from "@/lib/prisma/client";
import { PaymentFactory } from "@/lib/services/payments/payment-factory";
import { manualQrisService } from "@/lib/services/payments/manual-qris-service";

const createOrderSchema = z.object({
  userId: z.string().min(1),
  packageId: z.string().min(1),
});

export const orderService = {
  async createOrder(input: z.infer<typeof createOrderSchema>) {
    const payload = createOrderSchema.parse(input);
    const order = await orderRepository.createPending(payload.userId, payload.packageId);
    
    // Generate invoiceNo immediately at checkout creation
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNo = `INV-${order.package.sku || "JSTORE"}-${timestamp}-${Math.floor(100 + Math.random() * 900)}`;
    
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { invoiceNo },
      include: { package: { include: { product: true } }, user: true },
    });

    // Create Manual Payment
    const paymentResult = await manualQrisService.createPayment(updatedOrder);

    return paymentResult;
  },
};

