import { NextResponse } from "next/server";
import { productRepository } from "@/lib/repositories/product-repository";

export async function GET() {
  const data = await productRepository.findAll();
  return NextResponse.json(data);
}
