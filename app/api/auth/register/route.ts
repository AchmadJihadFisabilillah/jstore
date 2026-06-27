import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await authService.register(body);
    return NextResponse.json({ message: "Register berhasil." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan." },
      { status: 400 }
    );
  }
}
