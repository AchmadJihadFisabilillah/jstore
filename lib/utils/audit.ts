import { prisma } from "@/lib/prisma/client";

export async function logAdminActivity({
  userId,
  action,
  module,
  details,
  req,
}: {
  userId: string;
  action: string;
  module: string;
  details?: string;
  req?: Request;
}) {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      // Try to read IP and user-agent from headers
      ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
      userAgent = req.headers.get("user-agent");
    }

    await prisma.adminActivityLog.create({
      data: {
        userId,
        action,
        module,
        details,
        ipAddress: ipAddress ? ipAddress.split(",")[0].trim() : null,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write admin activity log:", error);
  }
}
