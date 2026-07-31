import { NextRequest, NextResponse } from "next/server";
import { getAllPrompts, Prompt } from "@/src/data/prompts";
import { matchesFilter } from "@/src/data/filter";

export const revalidate = 60;

const MAX_LIMIT = 100;

// getAllPrompts() sirali kart numarasini ve siralamayi TUM veri seti uzerinde
// hesapliyor, o yuzden DB'de sayfalama yapilamiyor - tamami cekilip burada
// dilimleniyor. Sicak lambda icinde 60sn memoize ediyoruz ki her istek 5300
// satiri yeniden cekmesin.
// ponytail: instance-basina bellek cache; hit orani yetmezse Redis/unstable_cache'e tasi
let memo: { at: number; data: Prompt[] } | null = null;

async function getPromptsCached(): Promise<Prompt[]> {
    if (memo && Date.now() - memo.at < 60_000) return memo.data;
    const data = await getAllPrompts();
    memo = { at: Date.now(), data };
    return data;
}

export async function GET(request: NextRequest) {
    const sp = request.nextUrl.searchParams;
    const category = sp.get("category") || "Tümü";
    const q = sp.get("q") || "";
    const offset = Math.max(0, parseInt(sp.get("offset") || "0", 10) || 0);
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(sp.get("limit") || "32", 10) || 32)
    );

    const all = await getPromptsCached();
    const filtered = all.filter((p) => matchesFilter(p, category, q));

    return NextResponse.json(
        {
            items: filtered.slice(offset, offset + limit),
            total: filtered.length,
        },
        {
            headers: {
                "Cache-Control":
                    "public, s-maxage=60, stale-while-revalidate=300",
            },
        }
    );
}
