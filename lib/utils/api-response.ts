import { NextResponse } from "next/server";

export function successResponse<T>(data: T, message: string = "Success", status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, error_code: string = "INTERNAL_SERVER_ERROR", status: number = 500) {
  // Hanya logging error code dan message, jangan log object error mentah yang berisiko membocorkan credential
  console.error(`[API ERROR] ${error_code}: ${message}`);
  
  return NextResponse.json(
    {
      success: false,
      message,
      error_code,
    },
    { status }
  );
}

// Wrapper khusus untuk catch block agar error aslinya (stack trace dll) tidak bocor
export function handleApiError(error: any) {
  console.error("[UNHANDLED API ERROR]", error);

  // Jika error adalah ZodError (validasi)
  if (error?.name === "ZodError") {
    return errorResponse("Validasi data gagal", "VALIDATION_ERROR", 400);
  }

  // Jika error dari Prisma (P2002: unique constraint, dsb)
  if (error?.code === "P2002") {
    return errorResponse("Data sudah ada (duplikat).", "DUPLICATE_DATA", 409);
  }

  return errorResponse("Terjadi kesalahan pada server.", "INTERNAL_SERVER_ERROR", 500);
}
