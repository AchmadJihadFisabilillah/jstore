import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { handleApiError, successResponse } from "@/lib/utils/api-response";
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Format email salah").optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission(PERMISSIONS.STOCK_VIEW);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    
    const suppliers = await prisma.supplier.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ]
      } : {},
      orderBy: { joinedAt: "desc" },
      include: {
        _count: {
          select: { stocks: true }
        }
      }
    });

    return successResponse({ suppliers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission(PERMISSIONS.STOCK_CREATE);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = supplierSchema.safeParse(body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const newSupplier = await prisma.supplier.create({
      data: parsed.data
    });

    return successResponse({ message: "Supplier berhasil ditambahkan", supplier: newSupplier });
  } catch (error) {
    return handleApiError(error);
  }
}

