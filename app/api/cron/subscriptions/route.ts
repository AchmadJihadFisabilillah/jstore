import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { addDays, startOfDay, endOfDay } from "date-fns";

// This should ideally be protected by an Authorization header (e.g. CRON_SECRET)
export async function GET(req: Request) {
  try {
    const today = new Date();
    
    // 1. Process EXPIRED subscriptions
    const expiredSubs = await prisma.subscription.findMany({
      where: {
        status: { in: ["ACTIVE", "EXPIRING"] },
        endDate: { lt: today }
      },
      include: { package: { include: { product: true } } }
    });

    for (const sub of expiredSubs) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRED" }
      });
      
      await prisma.notification.create({
        data: {
          userId: sub.userId,
          title: "Langganan Berakhir",
          message: `Masa aktif langganan ${sub.package.product.name} telah berakhir. Segera perpanjang untuk melanjutkan akses.`,
          type: "SUBSCRIPTION_ENDING",
          link: "/dashboard/langganan"
        }
      });
      
      // TODO: Webhook or Email/WA integration for EXPIRED can be placed here
    }

    // 2. Process H-7 reminders
    const targetH7 = addDays(today, 7);
    const h7Subs = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: startOfDay(targetH7),
          lte: endOfDay(targetH7)
        }
      },
      include: { package: { include: { product: true } } }
    });

    for (const sub of h7Subs) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRING" }
      });

      await prisma.notification.create({
        data: {
          userId: sub.userId,
          title: "Peringatan H-7 Langganan",
          message: `Langganan ${sub.package.product.name} Anda akan berakhir dalam 7 hari.`,
          type: "SUBSCRIPTION_ENDING",
          link: "/dashboard/langganan"
        }
      });
      
      // TODO: Webhook or Email/WA integration for H-7 can be placed here
    }

    // 3. Process H-3 reminders
    const targetH3 = addDays(today, 3);
    const h3Subs = await prisma.subscription.findMany({
      where: {
        status: "EXPIRING",
        endDate: {
          gte: startOfDay(targetH3),
          lte: endOfDay(targetH3)
        }
      },
      include: { package: { include: { product: true } } }
    });

    for (const sub of h3Subs) {
      await prisma.notification.create({
        data: {
          userId: sub.userId,
          title: "Peringatan H-3 Langganan",
          message: `Sisa 3 hari! Langganan ${sub.package.product.name} Anda hampir habis.`,
          type: "SUBSCRIPTION_ENDING",
          link: "/dashboard/langganan"
        }
      });
      
      // TODO: Webhook or Email/WA integration for H-3 can be placed here
    }

    return NextResponse.json({
      success: true,
      processed: {
        expired: expiredSubs.length,
        h7reminders: h7Subs.length,
        h3reminders: h3Subs.length
      }
    });
  } catch (error: any) {
    console.error("Cron Subscription Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
