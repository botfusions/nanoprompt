"use client";

import { useState } from "react";
import { Prompt } from "@/src/data/prompts";
import { PromptCard } from "./PromptCard";

const PAGE_SIZE = 32;

interface PromptGridProps {
    prompts: Prompt[];
    favorites: string[];
    onToggleFavorite: (id: string) => void;
}

export function PromptGrid({ prompts, favorites, onToggleFavorite }: PromptGridProps) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const visiblePrompts = prompts.slice(0, visibleCount);
    const hasMore = visibleCount < prompts.length;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {visiblePrompts.map((prompt) => (
                    <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        isFavorite={favorites.includes(prompt.id)}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                        className="bg-brand-black text-white border-4 border-brand-black font-black uppercase tracking-wider px-8 py-3 text-sm hover:bg-brand-yellow hover:text-brand-black transition-all shadow-neo active:translate-y-[1px] active:shadow-none"
                    >
                        DAHA FAZLA GOSTER ({prompts.length - visibleCount} kart kaldi)
                    </button>
                </div>
            )}
        </div>
    );
}
