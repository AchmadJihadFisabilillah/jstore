import { NextResponse } from "next/server";
import { productRepository, ProductSearchParams } from "@/lib/repositories/product-repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;
    const minPrice = searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const duration = searchParams.has("duration") ? Number(searchParams.get("duration")) : undefined;
    const stockStatus = searchParams.get("stockStatus") || undefined;
    const activationType = searchParams.get("activationType") || undefined;
    const sortBy = (searchParams.get("sortBy") as ProductSearchParams["sortBy"]) || "popular";
    const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.has("limit") ? Number(searchParams.get("limit")) : 12;

    const result = await productRepository.searchAndFilter({
      q,
      category,
      minPrice,
      maxPrice,
      duration,
      stockStatus,
      activationType,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PRODUCT_SEARCH]", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
