import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requirePermission, PERMISSIONS } from "@/lib/auth/rbac";
import { handleApiError, successResponse, errorResponse } from "@/lib/utils/api-response";
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Format email salah").optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requirePermission(PERMISSIONS.STOCK_UPDATE);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = supplierSchema.safeParse(body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: parsed.data
    });

    return successResponse({ message: "Supplier berhasil diupdate", supplier: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requirePermission(PERMISSIONS.STOCK_DELETE);
    if (!auth.ok) return auth.response;

    await prisma.supplier.delete({
      where: { id }
    });

    return successResponse({ message: "Supplier berhasil dihapus" });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return errorResponse("Supplier tidak dapat dihapus karena masih memiliki stok terkait.", "FOREIGN_KEY_CONSTRAINT", 400);
    }
    return handleApiError(error);
  }
}

