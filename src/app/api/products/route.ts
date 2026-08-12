import { NextResponse } from "next/server";
import { site } from "@/lib/site";

export const revalidate = 300;

export async function GET() {
  const catalog = site.shopifyCatalogUrl.replace(/\/+$/, "");
  const url = `${catalog}/products.json?limit=250`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Catalog unavailable", products: [] },
        { status: 502 },
      );
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[products] fetch failed", error);
    return NextResponse.json(
      { error: "Catalog fetch failed", products: [] },
      { status: 502 },
    );
  }
}
