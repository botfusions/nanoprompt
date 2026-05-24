"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import clsx from "clsx";

export interface BridgePrompt {
    id: string;
    title: string;
    description: string;
    prompt: string;
    image: string;
    tags?: string[];
}

interface BridgePromptCardProps {
    prompt: BridgePrompt;
    isSelected: boolean;
    onSelect: (prompt: BridgePrompt) => void;
}

export function BridgePromptCard({ prompt, isSelected, onSelect }: BridgePromptCardProps) {
    return (
        <div
            onClick={() => onSelect(prompt)}
            className={clsx(
                "cursor-pointer group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-200 hover:-translate-y-1",
                isSelected
                    ? "border-brand-purple bg-brand-purple/5 shadow-neo-strong ring-2 ring-brand-purple/50"
                    : "border-black bg-white shadow-neo hover:shadow-neo-hover"
            )}
        >
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden border-b-2 border-black bg-gray-100">
                <Image
                    src={prompt.image}
                    alt={prompt.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-purple/20 backdrop-blur-[2px]">
                        <div className="rounded-full bg-brand-purple p-2 text-white shadow-neo transition-transform duration-200 hover:scale-110">
                            <Check className="h-6 w-6" strokeWidth={3} />
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-4">
                {/* Tags */}
                <div className="mb-2 flex flex-wrap gap-2">
                    {prompt.tags?.slice(0, 2).map((tag) => (
                        <span
                            key={tag}
                            className="inline-block rounded-full border border-black bg-brand-yellow px-2 py-0.5 text-xs font-bold text-black"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-black">
                    {prompt.title}
                </h3>

                <p className="line-clamp-3 text-sm text-gray-600">
                    {prompt.description}
                </p>

                {/* Selection Indicator Text (Mobile/Accessibility) */}
                <div className="mt-auto pt-4">
                    <span className={clsx(
                        "text-xs font-bold uppercase tracking-wider",
                        isSelected ? "text-brand-purple" : "text-gray-400 group-hover:text-black"
                    )}>
                        {isSelected ? "Seçildi" : "Seçmek için tıkla"}
                    </span>
                </div>
            </div>
        </div>
    );
}
