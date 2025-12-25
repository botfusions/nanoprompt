"use client";

import Link from "next/link";
import { Github, Languages, HelpCircle } from "lucide-react";
import { AuthButton } from "./AuthButton";

export function Header() {
    return (
        <header className="bg-brand-cyan border-b-4 border-brand-black py-8 md:py-12 px-4 mb-8 md:mb-12 relative overflow-hidden w-full">
            {/* Top Bar */}
            <div className="container mx-auto flex justify-between items-center relative z-20 mb-8 md:mb-12">
                <Link href="/" className="bg-white border-2 border-brand-black px-4 py-2 shadow-neo font-black text-xl tracking-tighter hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none uppercase flex items-center gap-2">
                    BotsNANO
                    <span className="text-xs bg-brand-yellow text-brand-black px-1.5 py-0.5 border border-brand-black font-bold">(BETA)</span>
                </Link>

                <div className="flex items-center gap-3">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border-2 border-brand-black p-2 shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                    <button className="bg-white border-2 border-brand-black p-2 shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <div className="bg-white border-2 border-brand-black px-3 py-2 shadow-neo flex items-center gap-2 rounded-none font-bold text-sm uppercase">
                        <Languages className="w-4 h-4" />
                        <span>TR</span>
                    </div>
                    <AuthButton />
                </div>
            </div>

            {/* Hero Title */}
            <div className="container mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-8xl font-black mb-4 uppercase tracking-tighter text-white drop-shadow-[5px_5px_0_#000] leading-none transform -rotate-1">
                    BotsNANO
                    <br />
                    <span className="text-brand-yellow drop-shadow-[3px_3px_0_#000]">PROMPT</span> ARŞİVİ
                </h1>
                <p className="text-xl md:text-2xl font-bold text-brand-black bg-white inline-block px-4 py-1 border-2 border-brand-black shadow-neo transform rotate-1 rounded-none">
                    İlham veren en iyi prompt koleksiyonu
                </p>
            </div>
        </header>
    );
}
