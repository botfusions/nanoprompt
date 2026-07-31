"use client";

import { Prompt } from "@/src/data/prompts";
import { PromptCard } from "./PromptCard";

interface PromptGridProps {
    prompts: Prompt[];
    favorites: string[];
    onToggleFavorite: (id: string) => void;
    hasMore: boolean;
    loading: boolean;
    remaining: number;
    onLoadMore: () => void;
}

// Sayfalama artik burada degil: kartlar sunucudan parca parca geliyor,
// bu bilesen eline gecen listeyi oldugu gibi cizer.
export function PromptGrid({
    prompts,
    favorites,
    onToggleFavorite,
    hasMore,
    loading,
    remaining,
    onLoadMore,
}: PromptGridProps) {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {prompts.map((prompt) => (
                    <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        isFavorite={favorites.includes(prompt.id)}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>

            {prompts.length === 0 && !loading && (
                <div className="text-center py-16 font-mono text-brand-black/50">
                    Sonuc bulunamadi.
                </div>
            )}

            {hasMore && (
                <div className="flex justify-center mt-12">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="bg-brand-black text-white border-4 border-brand-black font-black uppercase tracking-wider px-8 py-3 text-sm hover:bg-brand-yellow hover:text-brand-black transition-all shadow-neo active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:cursor-wait"
                    >
                        {loading
                            ? "YUKLENIYOR..."
                            : `DAHA FAZLA GOSTER (${remaining} kart kaldi)`}
                    </button>
                </div>
            )}
        </div>
    );
}
