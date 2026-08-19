import { NextRequest, NextResponse } from "next/server";
import { getAllPrompts } from "@/src/data/prompts";
import { matchesFilter, matchesCategorySlug } from "@/src/data/filter";

export const revalidate = 3600;

const MAX_LIMIT = 100;

// Not: 60sn memo artik getAllPrompts()'un kendi icinde - tum cagiranlar paylasiyor.

export async function GET(request: NextRequest) {
    const sp = request.nextUrl.searchParams;
    const category = sp.get("category") || "Tümü";
    const q = sp.get("q") || "";
    // /kategori/[slug] sayfasi buradan besleniyor - kendi eslesme kurali var.
    const slug = sp.get("slug");
    const offset = Math.max(0, parseInt(sp.get("offset") || "0", 10) || 0);
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(sp.get("limit") || "32", 10) || 32)
    );

    const all = await getAllPrompts();
    const filtered = slug
        ? all.filter((p) => matchesCategorySlug(p, slug))
        : all.filter((p) => matchesFilter(p, category, q));

    return NextResponse.json(
        {
            items: filtered.slice(offset, offset + limit),
            total: filtered.length,
        },
        {
            headers: {
                "Cache-Control":
                    "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        }
    );
}
