"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Twitter,
    ExternalLink,
    Copy,
    Zap,
    Share2,
    Bookmark,
    Eye,
    Check
} from "lucide-react";
import { Prompt } from "@/src/data/prompts";
import { cn } from "@/lib/utils";

interface PromptCardProps {
    prompt: Prompt;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}


export function PromptCard({ prompt, isFavorite, onToggleFavorite }: PromptCardProps) {
    const [activeTab, setActiveTab] = useState<"prompt" | "original">("prompt");
    const [copied, setCopied] = useState(false);
    // Sabit numara - sıralama değişse bile aynı kalır
    const cardNumber = `#${String(prompt.displayNumber || 0).padStart(5, '0')}`;


    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative flex flex-col mt-12 w-full">
            {/* Tabs - Positioned absolutely above the card */}
            <div className="absolute -top-10 left-0 flex z-0">
                <button
                    onClick={() => setActiveTab("prompt")}
                    className={cn(
                        "h-10 px-6 font-black text-sm border-t-4 border-l-4 border-r-4 border-brand-black uppercase relative transition-all duration-100 ease-in-out pb-1 rounded-none",
                        activeTab === "prompt"
                            ? "bg-white translate-y-[4px] z-20 border-b-0 text-brand-black"
                            : "bg-gray-200 hover:bg-gray-100 translate-y-[8px] z-10 border-b-4 text-gray-500"
                    )}
                >
                    PROMPT
                </button>
                <button
                    onClick={() => setActiveTab("original")}
                    className={cn(
                        "h-10 px-6 font-black text-sm border-t-4 border-r-4 border-brand-black uppercase flex items-center gap-2 relative ml-[-4px] transition-all duration-100 ease-in-out rounded-none",
                        activeTab === "original"
                            ? "bg-white translate-y-[4px] z-20 border-b-0 text-brand-black"
                            : "bg-gray-200 hover:bg-gray-100 translate-y-[8px] z-10 border-b-4 border-l-4 text-gray-500"
                    )}
                >
                    ORIJINAL
                </button>
            </div>

            {/* Black Background Shadow Layer */}
            <div className="absolute inset-0 bg-brand-black translate-x-2 translate-y-2 z-0 rounded-none"></div>

            {/* Main Card Content */}
            <div className="relative z-10 bg-white border-4 border-brand-black p-5 flex flex-col transition-transform duration-200 ease-in-out rounded-none">

                {/* Featured Tag */}
                {prompt.featured && (
                    <div className="absolute -right-4 -top-3 z-30 bg-brand-yellow text-brand-black border-2 border-brand-black px-3 py-1 shadow-[2px_2px_0_#000] rotate-3 font-black uppercase text-xs tracking-wider rounded-none">
                        ÖNE ÇIKAN
                    </div>
                )}

                {/* Author Info */}
                <div className="flex items-center justify-between mb-4 border-b-2 border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-600">{cardNumber}</span>
                        <span className="font-black uppercase text-xs tracking-wide text-gray-500">
                            <span className="text-brand-black border-b-2 border-brand-yellow hover:bg-brand-yellow transition-colors cursor-pointer">@{prompt.author}</span>
                        </span>
                    </div>
                    <span className="font-mono text-xs text-gray-400">
                        {prompt.date}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black mb-4 leading-tight uppercase tracking-tight line-clamp-2 min-h-[3rem]">
                    {prompt.title}
                </h3>

                {/* Image Area */}
                <div className="mb-4 border-2 border-brand-black relative group/image bg-gray-200 rounded-none overflow-hidden">
                    <div className="aspect-video w-full relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={prompt.images?.[0] || "/placeholder.jpg"}
                            alt={prompt.title || "Prompt Image"}
                            className="object-cover w-full h-full transition-all duration-500 opacity-100 saturate-[1.15] contrast-[1.1] group-hover/image:scale-105 group-hover/image:brightness-110 group-hover/image:saturate-125 group-hover/image:contrast-115"
                            loading="lazy"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.jpg";
                            }}
                        />
                    </div>
                </div>

                {/* Description / Content */}
                <div className="mb-6 flex-grow">
                    <div className="bg-gray-50 border-2 border-brand-black p-3 font-mono text-xs md:text-sm text-gray-600 leading-relaxed h-32 overflow-y-auto custom-scrollbar rounded-none">
                        {activeTab === 'prompt' ? prompt.prompt : (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                <p>Orijinal kaynak için butona tıklayın.</p>
                                <ExternalLink className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-3 h-12">
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "flex-grow flex items-center justify-center gap-2 border-2 border-brand-black font-black uppercase tracking-wider transition-all shadow-none hover:shadow-neo active:translate-y-[1px] active:shadow-none rounded-none text-sm group/btn",
                            copied
                                ? "bg-green-500 text-white"
                                : "bg-brand-black text-white hover:bg-white hover:text-brand-black"
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>KOPYALANDI!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>KOPYALA</span>
                            </>
                        )}
                    </button>

                    <button className="w-12 flex items-center justify-center bg-white border-2 border-brand-black hover:bg-gray-100 transition-all shadow-none hover:shadow-neo active:translate-y-[1px] active:shadow-none rounded-none" title="Paylaş">
                        <Share2 className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => onToggleFavorite(prompt.id)}
                        className={cn(
                            "w-12 flex items-center justify-center border-2 border-brand-black transition-all shadow-none hover:shadow-neo active:translate-y-[1px] active:shadow-none rounded-none",
                            isFavorite ? "bg-brand-red text-white" : "bg-white hover:bg-gray-100"
                        )}
                        title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                    >
                        <Bookmark className={cn("w-5 h-5", isFavorite && "fill-current")} />
                    </button>
                </div>

            </div>
        </div>
    );
}
